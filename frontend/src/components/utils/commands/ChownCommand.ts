import type { Command } from "../../models/CommandResultModel.ts";
import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { usageError } from "./CommandHelpers.ts";

type OwnershipChange = { owner?: string; group?: string };

/**
 * Besitzer/Gruppe ändern wie Linux:
 * - Besitzer ändern darf nur root
 * - Gruppe ändern darf der Besitzer, aber nur auf eine Gruppe, in der er selbst ist
 */
export function changeOwnership(
    state: ShellStateModel,
    command: "chown" | "chgrp",
    node: FileSystemNodeModel,
    operand: string,
    change: OwnershipChange,
    recursive: boolean,
    lines: string[],
): void {
    const isRoot = state.user === "root";
    const ownerChanges = change.owner !== undefined && change.owner !== node.owner;
    const groupAllowed =
        change.group === undefined || (state.user === node.owner && state.groups.includes(change.group));

    if (!isRoot && (ownerChanges || !groupAllowed || state.user !== node.owner)) {
        const what = command === "chgrp" ? "group" : "ownership";
        lines.push(`${command}: changing ${what} of '${operand}': Operation not permitted`);
        return;
    }

    if (change.owner !== undefined) node.owner = change.owner;
    if (change.group !== undefined) node.group = change.group;
    // Bei normalen Dateien entfernt Linux SUID/SGID nach einem Besitzerwechsel
    if (node.type === "file") node.mode &= ~0o6000;

    if (recursive && node.type === "directory") {
        for (const child of Object.values(node.children ?? {})) {
            changeOwnership(state, command, child, `${operand}/${child.name}`, change, true, lines);
        }
    }
}

export function runOwnershipCommand(
    state: ShellStateModel,
    command: "chown" | "chgrp",
    change: OwnershipChange,
    operands: string[],
    recursive: boolean,
): string[] {
    const lines: string[] = [];
    for (const operand of operands) {
        const result = state.fs.lookup(resolvePath(state.cwd, operand), state.user, state.groups);
        if (!result.ok) {
            lines.push(`${command}: cannot access '${operand}': ${errorMessage(result.error)}`);
            continue;
        }
        changeOwnership(state, command, result.node, operand, change, recursive, lines);
    }
    return lines;
}

/** "anna", "anna:team", "anna:", ":team" */
function parseSpec(state: ShellStateModel, spec: string): OwnershipChange | string {
    const [ownerPart, groupPart] = spec.split(":", 2);
    const change: OwnershipChange = {};

    if (ownerPart) {
        const user = state.fs.findUser(ownerPart);
        if (!user) return `chown: invalid user: ‘${spec}’`;
        change.owner = user.name;
        if (groupPart === "") change.group = user.primaryGroup;
    }
    if (groupPart) {
        if (!state.fs.findGroup(groupPart)) return `chown: invalid group: ‘${spec}’`;
        change.group = groupPart;
    }
    return change;
}

export const chownCommand: Command = (args, state) => {
    const recursive = args.includes("-R") || args.includes("--recursive");
    const rest = args.filter((arg) => arg !== "-R" && arg !== "--recursive");
    if (rest.length === 0) return usageError("chown", "missing operand");
    if (rest.length === 1) return usageError("chown", `missing operand after '${rest[0]}'`);

    const change = parseSpec(state, rest[0]);
    if (typeof change === "string") return { lines: [change] };

    return { lines: runOwnershipCommand(state, "chown", change, rest.slice(1), recursive) };
};
