import type { ShellStateModel } from "../models/ShellStateModel.ts";
import type { TaskCheckModel } from "../models/TaskCheckModel.ts";
import type { TaskModel } from "../models/TaskModel.ts";
import { executeCommandLine } from "./commands/CommandRegistry.ts";
import { createFileSystem, createShellState } from "./filesystem/FileSystemFactory.ts";

/** Ausgangslage einer Aufgabe: frisches System, Setup als root, dann Login als Aufgaben-Benutzer */
export function createTaskState(task: TaskModel): ShellStateModel {
    const fs = createFileSystem(task.scenario);
    const rootState = createShellState("root", fs);
    rootState.cwd = "/";
    for (const command of task.setup ?? []) {
        const result = executeCommandLine(command, rootState);
        if (result.lines.length > 0) console.warn(`Setup von ${task.id}: ${command}`, result.lines);
    }

    const state = createShellState(task.user ?? "anna", fs);
    if (task.cwd && fs.getNode(task.cwd)?.type === "directory") {
        state.cwd = task.cwd;
        state.previousCwd = task.cwd;
    }
    return state;
}

/**
 * Klein, ohne Punkt am Ende. Leerzeichen, Komma und Semikolon gelten als derselbe Trenner,
 * damit "rwx, r-x, ---", "rwx r-x ---" und "rwx;r-x;---" gleich bewertet werden.
 */
export function normalizeAnswer(answer: string): string {
    return answer
        .trim()
        .toLowerCase()
        .replace(/\.$/, "")
        .replace(/\s*[,;]\s*|\s+/g, ",");
}

function normalizeCommand(line: string): string {
    return line.trim().replace(/\s+/g, " ");
}

function checkState(check: TaskCheckModel, state: ShellStateModel, lastCommand: string): boolean {
    switch (check.type) {
        case "mode": {
            const node = state.fs.getNode(check.path);
            return node !== undefined && (node.mode & 0o7777) === parseInt(check.mode, 8);
        }
        case "owner": {
            const node = state.fs.getNode(check.path);
            if (!node) return false;
            return (check.owner === undefined || node.owner === check.owner) && (check.group === undefined || node.group === check.group);
        }
        case "exists": {
            const node = state.fs.getNode(check.path);
            return node !== undefined && (check.nodeType === undefined || node.type === check.nodeType);
        }
        case "notExists":
            return state.fs.getNode(check.path) === undefined;
        case "cwd":
            return state.cwd === check.path;
        case "groupMember":
            return state.fs.groupsOfUser(check.user).includes(check.group);
        case "sessionUser":
            return state.user === check.user;
        case "command":
            return new RegExp(check.pattern, "i").test(normalizeCommand(lastCommand));
        case "answer":
            return false;
        case "all":
            return check.checks.every((part) => checkState(part, state, lastCommand));
        case "any":
            return check.checks.some((part) => checkState(part, state, lastCommand));
    }
}

/** Nach jedem Befehl: ist das Ziel einer Terminal-Aufgabe erreicht? */
export function isTerminalTaskSolved(task: TaskModel, state: ShellStateModel, lastCommand: string): boolean {
    return task.type === "terminal" && checkState(task.check, state, lastCommand);
}

export function isAnswerCorrect(task: TaskModel, answer: string): boolean {
    if (task.check.type !== "answer") return false;
    const given = normalizeAnswer(answer);
    return task.check.accepted.some((accepted) => normalizeAnswer(accepted) === given);
}
