import type { Command } from "../../models/CommandResultModel.ts";
import { findInvalidFlag, splitFlags } from "../CommandParser.ts";
import { usageError } from "./CommandHelpers.ts";

/**
 * `id` zeigt die Gruppen der aktuellen Sitzung,
 * `id benutzer` die Gruppen laut /etc/group (also auch frisch hinzugefügte).
 */
export const idCommand: Command = (args, state) => {
    const { flags, operands } = splitFlags(args);
    const invalid = findInvalidFlag(flags, "ugGn");
    if (invalid) return usageError("id", `invalid option -- '${invalid}'`);

    const name = operands[0] ?? state.user;
    const user = state.fs.findUser(name);
    if (!user) return { lines: [`id: ‘${name}’: no such user`] };

    const groupNames = operands.length > 0 ? state.fs.groupsOfUser(name) : state.groups;
    const groups = groupNames.map((groupName) => ({ name: groupName, gid: state.fs.findGroup(groupName)?.gid ?? 0 }));
    const primary = groups[0];
    const names = flags.has("n");

    if (flags.has("u")) return { lines: [names ? user.name : String(user.uid)] };
    if (flags.has("g")) return { lines: [names ? primary.name : String(primary.gid)] };
    if (flags.has("G")) return { lines: [groups.map((group) => (names ? group.name : group.gid)).join(" ")] };

    const groupList = groups.map((group) => `${group.gid}(${group.name})`).join(",");
    return { lines: [`uid=${user.uid}(${user.name}) gid=${primary.gid}(${primary.name}) groups=${groupList}`] };
};
