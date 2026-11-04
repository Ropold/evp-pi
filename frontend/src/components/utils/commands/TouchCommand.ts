import type { Command } from "../../models/CommandResultModel.ts";
import { resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { can, createNode, prepareCreate, usageError } from "./CommandHelpers.ts";

export const touchCommand: Command = (args, state) => {
    const operands = args.filter((arg) => !arg.startsWith("-"));
    if (operands.length === 0) return usageError("touch", "missing file operand");

    const lines: string[] = [];
    for (const operand of operands) {
        const fail = (reason: string) => lines.push(`touch: cannot touch '${operand}': ${reason}`);
        const target = prepareCreate(state, resolvePath(state.cwd, operand));

        if (!target.ok) {
            fail(errorMessage(target.error));
        } else if (target.existing) {
            // Zeitstempel ändern: Besitzer, root oder wer w hat
            const node = target.existing;
            if (state.user === "root" || state.user === node.owner || can(state, node, "w")) {
                node.modified = Date.now();
            } else {
                fail("Permission denied");
            }
        } else {
            createNode(state, target.parent, target.name, "file", 0o666);
        }
    }
    return { lines };
};
