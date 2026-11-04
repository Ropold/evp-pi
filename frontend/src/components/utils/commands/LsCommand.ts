import type { Command } from "../../models/CommandResultModel.ts";
import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { findInvalidFlag, splitFlags } from "../CommandParser.ts";
import { hasPermission } from "../filesystem/PermissionCheck.ts";
import { modeToString } from "../filesystem/PermissionConverter.ts";
import { parentPath, resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";

const BLUE = "\x1b[1;34m";
const GREEN = "\x1b[1;32m";
const RESET = "\x1b[0m";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type Entry = {
    name: string;
    node: FileSystemNodeModel;
    /** false = Rechte/Besitzer unbekannt (kein x auf dem Ordner) */
    readable: boolean;
};

function colorName(name: string, node: FileSystemNodeModel): string {
    if (node.type === "directory") return BLUE + name + RESET;
    if (node.mode & 0o111) return GREEN + name + RESET;
    return name;
}

function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, " ");
    const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    return `${MONTHS[date.getMonth()]} ${day} ${time}`;
}

function linkCount(node: FileSystemNodeModel): number {
    if (node.type !== "directory") return 1;
    return 2 + Object.values(node.children ?? {}).filter((child) => child.type === "directory").length;
}

function size(node: FileSystemNodeModel): number {
    return node.type === "directory" ? 4096 : (node.content ?? "").length;
}

/** Sortierung wie ls unter Ubuntu: Groß/Klein und führender Punkt egal */
function compareNames(a: string, b: string): number {
    const key = (name: string) => name.replace(/^\.+/, "");
    return key(a).localeCompare(key(b), "en", { sensitivity: "base" }) || a.localeCompare(b);
}

function formatLong(entries: Entry[]): string[] {
    const rows = entries.map(({ name, node, readable }) =>
        readable
            ? [modeToString(node), String(linkCount(node)), node.owner, node.group, String(size(node)), formatDate(node.modified), colorName(name, node)]
            : [(node.type === "directory" ? "d" : "-") + "?????????", "?", "?", "?", "?", "           ?", name],
    );
    const widths = [0, 1, 2, 3, 4].map((col) => Math.max(...rows.map((row) => row[col].length)));

    return rows.map((row) =>
        [
            row[0],
            row[1].padStart(widths[1]),
            row[2].padEnd(widths[2]),
            row[3].padEnd(widths[3]),
            row[4].padStart(widths[4]),
            row[5],
            row[6],
        ].join(" "),
    );
}

function formatShort(entries: Entry[]): string[] {
    if (entries.length === 0) return [];
    return [entries.map(({ name, node }) => colorName(name, node)).join("  ")];
}

/** Inhalt eines Verzeichnisses auflisten (braucht r, für -l zusätzlich x) */
function listDirectory(
    state: ShellStateModel,
    operand: string,
    path: string,
    directory: FileSystemNodeModel,
    flags: Set<string>,
    errors: string[],
): string[] | null {
    if (!hasPermission(state.user, state.groups, directory, "r")) {
        errors.push(`ls: cannot open directory '${operand}': Permission denied`);
        return null;
    }

    const canStat = hasPermission(state.user, state.groups, directory, "x");
    const entries: Entry[] = Object.values(directory.children ?? {})
        .filter((child) => flags.has("a") || !child.name.startsWith("."))
        .map((child) => ({ name: child.name, node: child, readable: canStat }));

    if (flags.has("a")) {
        const parent = state.fs.getNode(parentPath(path)) ?? directory;
        entries.push({ name: ".", node: directory, readable: canStat });
        entries.push({ name: "..", node: parent, readable: canStat });
    }
    entries.sort((a, b) => compareNames(a.name, b.name));

    if (!flags.has("l")) return formatShort(entries);

    if (!canStat) {
        const prefix = operand.endsWith("/") ? operand : operand + "/";
        for (const entry of entries) errors.push(`ls: cannot access '${prefix}${entry.name}': Permission denied`);
    }
    const blocks = entries.reduce((sum, { node }) => sum + (size(node) > 0 ? 4 : 0), 0);
    return [`total ${canStat ? blocks : 0}`, ...formatLong(entries)];
}

export const lsCommand: Command = (args, state) => {
    const { flags, operands } = splitFlags(args);
    const invalid = findInvalidFlag(flags, "lad");
    if (invalid) {
        return { lines: [`ls: invalid option -- '${invalid}'`, "Try 'ls --help' for more information."] };
    }

    const targets = operands.length > 0 ? operands : ["."];
    const errors: string[] = [];
    const files: Entry[] = [];
    const directories: { operand: string; path: string; node: FileSystemNodeModel }[] = [];

    for (const operand of targets) {
        const path = resolvePath(state.cwd, operand);
        const result = state.fs.lookup(path, state.user, state.groups);
        if (!result.ok) {
            errors.push(`ls: cannot access '${operand}': ${errorMessage(result.error)}`);
        } else if (result.node.type === "directory" && !flags.has("d")) {
            directories.push({ operand, path, node: result.node });
        } else {
            files.push({ name: operand, node: result.node, readable: true });
        }
    }

    const output: string[] = [];
    if (files.length > 0) {
        files.sort((a, b) => compareNames(a.name, b.name));
        output.push(...(flags.has("l") ? formatLong(files) : formatShort(files)));
    }

    const showHeaders = targets.length > 1;
    directories.sort((a, b) => compareNames(a.operand, b.operand));
    for (const { operand, path, node } of directories) {
        const listing = listDirectory(state, operand, path, node, flags, errors);
        if (listing === null) continue;
        if (showHeaders) {
            if (output.length > 0) output.push("");
            output.push(`${operand}:`);
        }
        output.push(...listing);
    }

    return { lines: [...errors, ...output] };
};
