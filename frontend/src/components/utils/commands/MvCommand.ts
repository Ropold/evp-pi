import type { Command } from "../../models/CommandResultModel.ts";
import { findInvalidFlag, splitFlags } from "../CommandParser.ts";
import { baseName, parentPath, resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { can, prepareCreate, removeChild, stickyBlocks, usageError } from "./CommandHelpers.ts";

/**
 * Verschieben = Eintrag im alten Ordner entfernen und im neuen anlegen.
 * Dafür braucht man w und x auf BEIDEN Ordnern. Besitzer, Gruppe und Rechte bleiben gleich.
 */
export const mvCommand: Command = (args, state) => {
    const { flags, operands } = splitFlags(args);
    const invalid = findInvalidFlag(flags, "fiv");
    if (invalid) return usageError("mv", `invalid option -- '${invalid}'`);
    if (operands.length === 0) return usageError("mv", "missing file operand");
    if (operands.length === 1) return usageError("mv", `missing destination file operand after '${operands[0]}'`);

    const destination = operands[operands.length - 1];
    const destinationPath = resolvePath(state.cwd, destination);
    const destinationResult = state.fs.lookup(destinationPath, state.user, state.groups);
    const intoDirectory = destinationResult.ok && destinationResult.node.type === "directory";
    const sources = operands.slice(0, -1);

    if (sources.length > 1 && !intoDirectory) return { lines: [`mv: target '${destination}' is not a directory`] };

    const lines: string[] = [];
    for (const operand of sources) {
        const sourcePath = resolvePath(state.cwd, operand);
        const result = state.fs.lookup(sourcePath, state.user, state.groups);
        if (!result.ok) {
            lines.push(`mv: cannot stat '${operand}': ${errorMessage(result.error)}`);
            continue;
        }

        const node = result.node;
        const sourceParent = state.fs.getNode(parentPath(sourcePath));
        const targetPath = intoDirectory ? `${destinationPath}/${baseName(sourcePath)}`.replace("//", "/") : destinationPath;
        const targetDisplay = intoDirectory ? `${destination.replace(/\/$/, "")}/${baseName(sourcePath)}` : destination;
        const fail = (reason: string) => lines.push(`mv: cannot move '${operand}' to '${targetDisplay}': ${reason}`);

        if (!sourceParent || sourcePath === "/") {
            fail("Device or resource busy");
            continue;
        }
        if (targetPath === sourcePath) {
            lines.push(`mv: '${operand}' and '${targetDisplay}' are the same file`);
            continue;
        }
        if (targetPath.startsWith(sourcePath + "/")) {
            lines.push(`mv: cannot move '${operand}' to a subdirectory of itself, '${targetDisplay}'`);
            continue;
        }

        const target = prepareCreate(state, targetPath);
        if (!target.ok) {
            fail(errorMessage(target.error));
            continue;
        }
        if (target.existing?.type === "directory" && node.type !== "directory") {
            lines.push(`mv: cannot overwrite directory '${targetDisplay}' with non-directory`);
            continue;
        }
        if (target.existing && target.existing.type !== "directory" && node.type === "directory") {
            lines.push(`mv: cannot overwrite non-directory '${targetDisplay}' with directory '${operand}'`);
            continue;
        }
        if (target.existing?.type === "directory" && Object.keys(target.existing.children ?? {}).length > 0) {
            fail("Directory not empty");
            continue;
        }

        const targetParentWritable = can(state, target.parent, "w") && can(state, target.parent, "x");
        if (!can(state, sourceParent, "w") || !targetParentWritable || stickyBlocks(state, sourceParent, node)) {
            fail("Permission denied");
            continue;
        }

        removeChild(sourceParent, node.name);
        node.name = target.name;
        state.fs.addChild(target.parent, node);
    }
    return { lines };
};
