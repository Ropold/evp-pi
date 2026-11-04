import type { Command } from "../../models/CommandResultModel.ts";
import { usageError } from "./CommandHelpers.ts";
import { runOwnershipCommand } from "./ChownCommand.ts";

export const chgrpCommand: Command = (args, state) => {
    const recursive = args.includes("-R");
    const rest = args.filter((arg) => arg !== "-R");
    if (rest.length === 0) return usageError("chgrp", "missing operand");
    if (rest.length === 1) return usageError("chgrp", `missing operand after '${rest[0]}'`);

    const group = rest[0];
    if (!state.fs.findGroup(group)) return { lines: [`chgrp: invalid group: ‘${group}’`] };

    return { lines: runOwnershipCommand(state, "chgrp", { group }, rest.slice(1), recursive) };
};
