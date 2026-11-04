import type { Command } from "../../models/CommandResultModel.ts";
import { parentPath, resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { can, removeChild, stickyBlocks, usageError } from "./CommandHelpers.ts";

export const rmdirCommand: Command = (args, state) => {
    const operands = args.filter((arg) => !arg.startsWith("-"));
    if (operands.length === 0) return usageError("rmdir", "missing operand");

    const lines: string[] = [];
    for (const operand of operands) {
        const fail = (reason: string) => lines.push(`rmdir: failed to remove '${operand}': ${reason}`);
        const path = resolvePath(state.cwd, operand);
        const result = state.fs.lookup(path, state.user, state.groups);
        const parent = state.fs.getNode(parentPath(path));

        if (!result.ok) {
            fail(errorMessage(result.error));
        } else if (result.node.type !== "directory") {
            fail("Not a directory");
        } else if (Object.keys(result.node.children ?? {}).length > 0) {
            fail("Directory not empty");
        } else if (!parent || path === "/" || !can(state, parent, "w") || stickyBlocks(state, parent, result.node)) {
            fail("Permission denied");
        } else {
            removeChild(parent, result.node.name);
        }
    }
    return { lines };
};
