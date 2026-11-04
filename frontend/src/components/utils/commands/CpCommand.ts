import type { Command } from "../../models/CommandResultModel.ts";
import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { findInvalidFlag, splitFlags } from "../CommandParser.ts";
import { baseName, resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { can, createNode, prepareCreate, usageError } from "./CommandHelpers.ts";

/**
 * Kopiert source nach targetPath. Die Kopie gehört dem aktuellen Benutzer,
 * Rechte = Rechte der Quelle minus umask (ohne Spezialbits).
 */
function copyNode(
    state: ShellStateModel,
    source: FileSystemNodeModel,
    sourceDisplay: string,
    targetPath: string,
    targetDisplay: string,
    lines: string[],
): void {
    if (source.type === "file" && !can(state, source, "r")) {
        lines.push(`cp: cannot open '${sourceDisplay}' for reading: Permission denied`);
        return;
    }
    if (source.type === "directory" && (!can(state, source, "r") || !can(state, source, "x"))) {
        lines.push(`cp: cannot access '${sourceDisplay}': Permission denied`);
        return;
    }

    const target = prepareCreate(state, targetPath);
    if (!target.ok) {
        const kind = source.type === "directory" ? "directory" : "regular file";
        lines.push(`cp: cannot create ${kind} '${targetDisplay}': ${errorMessage(target.error)}`);
        return;
    }

    if (source.type === "file") {
        const existing = target.existing;
        if (existing?.type === "directory") {
            lines.push(`cp: cannot overwrite directory '${targetDisplay}' with non-directory`);
        } else if (existing) {
            if (!can(state, existing, "w")) {
                lines.push(`cp: cannot create regular file '${targetDisplay}': Permission denied`);
            } else {
                existing.content = source.content;
                existing.modified = Date.now();
            }
        } else {
            createNode(state, target.parent, target.name, "file", source.mode, source.content);
        }
        return;
    }

    let directory = target.existing;
    if (directory && directory.type !== "directory") {
        lines.push(`cp: cannot overwrite non-directory '${targetDisplay}' with directory '${sourceDisplay}'`);
        return;
    }
    directory ??= createNode(state, target.parent, target.name, "directory", source.mode);

    for (const child of Object.values(source.children ?? {})) {
        if (child === directory) continue;
        copyNode(state, child, `${sourceDisplay}/${child.name}`, `${targetPath}/${child.name}`, `${targetDisplay}/${child.name}`, lines);
    }
}

export const cpCommand: Command = (args, state) => {
    const { flags, operands } = splitFlags(args);
    const invalid = findInvalidFlag(flags, "rRaiv");
    if (invalid) return usageError("cp", `invalid option -- '${invalid}'`);
    if (operands.length === 0) return usageError("cp", "missing file operand");
    if (operands.length === 1) return usageError("cp", `missing destination file operand after '${operands[0]}'`);

    const recursive = flags.has("r") || flags.has("R") || flags.has("a");
    const destination = operands[operands.length - 1];
    const destinationPath = resolvePath(state.cwd, destination);
    const destinationResult = state.fs.lookup(destinationPath, state.user, state.groups);
    const intoDirectory = destinationResult.ok && destinationResult.node.type === "directory";
    const sources = operands.slice(0, -1);

    if (sources.length > 1 && !intoDirectory) return { lines: [`cp: target '${destination}' is not a directory`] };

    const lines: string[] = [];
    for (const operand of sources) {
        const sourcePath = resolvePath(state.cwd, operand);
        const result = state.fs.lookup(sourcePath, state.user, state.groups);
        if (!result.ok) {
            lines.push(`cp: cannot stat '${operand}': ${errorMessage(result.error)}`);
            continue;
        }
        if (result.node.type === "directory" && !recursive) {
            lines.push(`cp: -r not specified; omitting directory '${operand}'`);
            continue;
        }

        const targetPath = intoDirectory ? `${destinationPath}/${baseName(sourcePath)}`.replace("//", "/") : destinationPath;
        const targetDisplay = intoDirectory ? `${destination.replace(/\/$/, "")}/${baseName(sourcePath)}` : destination;

        if (targetPath === sourcePath) {
            lines.push(`cp: '${operand}' and '${targetDisplay}' are the same file`);
            continue;
        }
        if (targetPath.startsWith(sourcePath + "/")) {
            lines.push(`cp: cannot copy a directory, '${operand}', into itself, '${targetDisplay}'`);
            continue;
        }
        copyNode(state, result.node, operand, targetPath, targetDisplay, lines);
    }
    return { lines };
};
