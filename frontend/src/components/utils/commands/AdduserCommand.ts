import type { Command } from "../../models/CommandResultModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { refreshSystemFiles } from "../filesystem/FileSystemFactory.ts";

function addToGroup(state: ShellStateModel, userName: string, groupName: string): string[] {
    const user = state.fs.findUser(userName);
    const group = state.fs.findGroup(groupName);
    if (!user) return [`adduser: The user \`${userName}' does not exist.`];
    if (!group) return [`adduser: The group \`${groupName}' does not exist.`];

    if (group.members.includes(userName) || user.primaryGroup === groupName) {
        return [`adduser: The user \`${userName}' is already a member of \`${groupName}'.`];
    }
    group.members.push(userName);
    refreshSystemFiles(state.fs);
    return [`Adding user \`${userName}' to group \`${groupName}' ...`, "Done."];
}

function createUser(state: ShellStateModel, userName: string): string[] {
    if (!/^[a-z_][a-z0-9_-]*$/.test(userName)) {
        return ["adduser: Please enter a username matching the regular expression", "configured via the NAME_REGEX configuration variable."];
    }
    if (state.fs.findUser(userName)) return [`adduser: The user \`${userName}' already exists.`];

    const id = Math.max(1000, ...state.fs.users.map((user) => user.uid), ...state.fs.groups.map((group) => group.gid)) + 1;
    const home = `/home/${userName}`;
    state.fs.groups.push({ name: userName, gid: id, members: [] });
    state.fs.users.push({ name: userName, uid: id, primaryGroup: userName, home });

    const homeParent = state.fs.getNode("/home");
    if (homeParent && !homeParent.children?.[userName]) {
        state.fs.addChild(homeParent, {
            name: userName,
            type: "directory",
            owner: userName,
            group: userName,
            mode: 0o750,
            modified: Date.now(),
            children: {},
        });
    }
    refreshSystemFiles(state.fs);
    return [
        `Adding user \`${userName}' ...`,
        `Adding new group \`${userName}' (${id}) ...`,
        `Adding new user \`${userName}' (${id}) with group \`${userName}' ...`,
        `Creating home directory \`${home}' ...`,
        "Done.",
    ];
}

export const adduserCommand: Command = (args, state) => {
    const operands = args.filter((arg) => !arg.startsWith("-"));
    if (state.user !== "root") return { lines: ["adduser: Only root may add a user or group to the system."] };
    if (operands.length === 0) return { lines: ["adduser: Only one or two names allowed."] };
    if (operands.length > 2) return { lines: ["adduser: Specify only one name in this mode."] };

    return { lines: operands.length === 2 ? addToGroup(state, operands[0], operands[1]) : createUser(state, operands[0]) };
};
