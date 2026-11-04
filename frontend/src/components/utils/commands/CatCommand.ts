import type { Command } from "../../models/CommandResultModel.ts";
import { resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { can } from "./CommandHelpers.ts";

export const catCommand: Command = (args, state) => {
    const lines: string[] = [];

    for (const operand of args.filter((arg) => !arg.startsWith("-"))) {
        const result = state.fs.lookup(resolvePath(state.cwd, operand), state.user, state.groups);
        if (!result.ok) {
            lines.push(`cat: ${operand}: ${errorMessage(result.error)}`);
        } else if (result.node.type === "directory") {
            lines.push(`cat: ${operand}: Is a directory`);
        } else if (!can(state, result.node, "r")) {
            lines.push(`cat: ${operand}: Permission denied`);
        } else {
            const content = result.node.content ?? "";
            if (content.length > 0) lines.push(...content.replace(/\n$/, "").split("\n"));
        }
    }
    return { lines };
};
