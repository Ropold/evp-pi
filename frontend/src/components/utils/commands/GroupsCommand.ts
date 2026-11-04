import type { Command } from "../../models/CommandResultModel.ts";

export const groupsCommand: Command = (args, state) => {
    if (args.length === 0) return { lines: [state.groups.join(" ")] };

    return {
        lines: args.map((name) =>
            state.fs.findUser(name)
                ? `${name} : ${state.fs.groupsOfUser(name).join(" ")}`
                : `groups: ‘${name}’: no such user`,
        ),
    };
};
