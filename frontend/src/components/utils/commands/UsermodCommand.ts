import type { Command } from "../../models/CommandResultModel.ts";
import { refreshSystemFiles } from "../filesystem/FileSystemFactory.ts";

const USAGE = ["Usage: usermod [options] LOGIN", "", "Options:", "  -a, --append    append the user to the supplemental GROUPS (use only with -G)", "  -G, --groups    new list of supplementary GROUPS"];

export const usermodCommand: Command = (args, state) => {
    let append = false;
    let groupList: string | undefined;
    const operands: string[] = [];

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--append") {
            append = true;
        } else if (arg === "--groups") {
            groupList = args[++i];
        } else if (arg.startsWith("-") && arg.length > 1) {
            for (const flag of arg.slice(1)) {
                if (flag === "a") {
                    append = true;
                } else if (flag === "G") {
                    groupList = args[++i];
                } else {
                    return { lines: [`usermod: invalid option -- '${flag}'`, ...USAGE] };
                }
            }
        } else {
            operands.push(arg);
        }
    }

    if (operands.length !== 1 || groupList === undefined) return { lines: USAGE };
    if (state.user !== "root") {
        return { lines: ["usermod: Permission denied.", "usermod: cannot lock /etc/passwd; try again later."] };
    }

    const userName = operands[0];
    if (!state.fs.findUser(userName)) return { lines: [`usermod: user '${userName}' does not exist`] };

    const groupNames = groupList.split(",").filter(Boolean);
    const missing = groupNames.find((name) => !state.fs.findGroup(name));
    if (missing) return { lines: [`usermod: group '${missing}' does not exist`] };

    // Ohne -a werden alle bisherigen weiteren Gruppen entfernt
    if (!append) {
        for (const group of state.fs.groups) group.members = group.members.filter((member) => member !== userName);
    }
    for (const name of groupNames) {
        const group = state.fs.findGroup(name);
        if (group && !group.members.includes(userName)) group.members.push(userName);
    }
    refreshSystemFiles(state.fs);
    return { lines: [] };
};
