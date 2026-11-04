import type { ShellStateModel } from "../models/ShellStateModel.ts";
import { commandNames } from "./commands/CommandRegistry.ts";
import { hasPermission } from "./filesystem/PermissionCheck.ts";
import { resolvePath } from "./filesystem/PathResolver.ts";

export type CompletionResult = {
    /** Neue Zeile bis zum Cursor */
    line: string;
    /** Mehrere Treffer ohne gemeinsamen Fortschritt: zum Anzeigen */
    matches: string[];
};

function commonPrefix(values: string[]): string {
    if (values.length === 0) return "";
    let prefix = values[0];
    for (const value of values.slice(1)) {
        while (!value.startsWith(prefix)) prefix = prefix.slice(0, -1);
    }
    return prefix;
}

function escapeSpaces(text: string): string {
    return text.replace(/ /g, "\\ ");
}

function completePath(word: string, state: ShellStateModel): { candidates: string[]; labels: string[] } {
    const slash = word.lastIndexOf("/");
    const directoryPart = slash >= 0 ? word.slice(0, slash + 1) : "";
    const prefix = (slash >= 0 ? word.slice(slash + 1) : word).replace(/\\ /g, " ");

    let lookupDirectory = directoryPart.replace(/\\ /g, " ") || ".";
    if (lookupDirectory === "~" || lookupDirectory.startsWith("~/")) lookupDirectory = state.home + lookupDirectory.slice(1);

    const result = state.fs.lookup(resolvePath(state.cwd, lookupDirectory), state.user, state.groups);
    if (!result.ok || result.node.type !== "directory") return { candidates: [], labels: [] };
    if (!hasPermission(state.user, state.groups, result.node, "r")) return { candidates: [], labels: [] };

    const children = Object.values(result.node.children ?? {})
        .filter((child) => child.name.startsWith(prefix))
        .filter((child) => prefix.startsWith(".") || !child.name.startsWith("."))
        .sort((a, b) => a.name.localeCompare(b.name));

    return {
        candidates: children.map((child) => directoryPart + escapeSpaces(child.name) + (child.type === "directory" ? "/" : "")),
        labels: children.map((child) => child.name + (child.type === "directory" ? "/" : "")),
    };
}

/** Vervollständigt das letzte Wort: am Zeilenanfang (oder nach sudo) Befehle, sonst Pfade */
export function completeLine(line: string, state: ShellStateModel): CompletionResult {
    const start = line.search(/(?<!\\) (?=[^ ]*$)/) + 1;
    const before = line.slice(0, start);
    const word = line.slice(start);
    const previousWords = before.trim().split(/\s+/).filter(Boolean);
    const isCommand = previousWords.length === 0 || (previousWords.length === 1 && previousWords[0] === "sudo");

    let candidates: string[];
    let labels: string[];
    if (isCommand && !word.includes("/")) {
        candidates = commandNames().filter((name) => name.startsWith(word));
        labels = candidates;
    } else {
        ({ candidates, labels } = completePath(word, state));
    }

    if (candidates.length === 0) return { line, matches: [] };
    if (candidates.length === 1) {
        const completed = candidates[0];
        return { line: before + completed + (completed.endsWith("/") ? "" : " "), matches: [] };
    }

    const prefix = commonPrefix(candidates);
    if (prefix.length > word.length) return { line: before + prefix, matches: [] };
    return { line, matches: labels };
}
