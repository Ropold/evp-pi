import type { Command } from "../../models/CommandResultModel.ts";
import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { findInvalidFlag, splitFlags } from "../CommandParser.ts";
import { baseName, parentPath, resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { can, removeChild, stickyBlocks, usageError } from "./CommandHelpers.ts";

/** Prüft, ob ein Ordnerinhalt rekursiv gelöscht werden darf (r, w, x auf jedem nicht leeren Ordner) */
function treeError(state: ShellStateModel, directory: FileSystemNodeModel, display: string): string | null {
    const children = Object.values(directory.children ?? {});
    if (children.length === 0) return null;

    if (!can(state, directory, "r") || !can(state, directory, "x")) {
        return `rm: cannot remove '${display}': Permission denied`;
    }
    if (!can(state, directory, "w")) {
        return `rm: cannot remove '${display}/${children[0].name}': Permission denied`;
    }
    for (const child of children) {
        if (child.type === "directory") {
            const error = treeError(state, child, `${display}/${child.name}`);
            if (error) return error;
        }
    }
    return null;
}

export const rmCommand: Command = (args, state) => {
    const { flags, operands } = splitFlags(args);
    const invalid = findInvalidFlag(flags, "rRfiv");
    if (invalid) return usageError("rm", `invalid option -- '${invalid}'`);
    if (operands.length === 0) return flags.has("f") ? { lines: [] } : usageError("rm", "missing operand");

    const recursive = flags.has("r") || flags.has("R");
    const lines: string[] = [];

    for (const operand of operands) {
        const fail = (reason: string) => lines.push(`rm: cannot remove '${operand}': ${reason}`);
        const path = resolvePath(state.cwd, operand);

        if (path === "/") {
            lines.push("rm: it is dangerous to operate recursively on '/'");
            continue;
        }
        if (baseName(operand) === "." || baseName(operand) === "..") {
            lines.push(`rm: refusing to remove '.' or '..' directory: skipping '${operand}'`);
            continue;
        }

        const result = state.fs.lookup(path, state.user, state.groups);
        if (!result.ok) {
            if (!(flags.has("f") && result.error === "ENOENT")) fail(errorMessage(result.error));
            continue;
        }

        const node = result.node;
        const parent = state.fs.getNode(parentPath(path));
        if (!parent) continue;

        if (node.type === "directory" && !recursive) {
            fail("Is a directory");
            continue;
        }
        if (node.type === "directory") {
            const error = treeError(state, node, operand.replace(/\/$/, ""));
            if (error) {
                lines.push(error);
                continue;
            }
        }
        if (!can(state, parent, "w") || stickyBlocks(state, parent, node)) {
            fail("Permission denied");
            continue;
        }
        removeChild(parent, node.name);
    }
    return { lines };
};
