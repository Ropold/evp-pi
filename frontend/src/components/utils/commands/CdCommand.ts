import type { Command } from "../../models/CommandResultModel.ts";
import { hasPermission } from "../filesystem/PermissionCheck.ts";
import { resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";

export const cdCommand: Command = (args, state) => {
    if (args.length > 1) return { lines: ["bash: cd: too many arguments"] };

    let input = args[0] ?? state.home;
    const printNewPath = input === "-";
    if (printNewPath) input = state.previousCwd;

    const target = resolvePath(state.cwd, input);
    const result = state.fs.lookup(target, state.user, state.groups);
    const shown = args[0] ?? input;

    if (!result.ok) return { lines: [`bash: cd: ${shown}: ${errorMessage(result.error)}`] };
    if (result.node.type !== "directory") return { lines: [`bash: cd: ${shown}: Not a directory`] };
    if (!hasPermission(state.user, state.groups, result.node, "x")) {
        return { lines: [`bash: cd: ${shown}: Permission denied`] };
    }

    state.previousCwd = state.cwd;
    state.cwd = target;
    return { lines: printNewPath ? [target] : [] };
};
