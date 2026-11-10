import type { Command } from "../../models/CommandResultModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { refreshSystemFiles } from "../filesystem/FileSystemFactory.ts";

const NAME_PATTERN = /^[a-z_][a-z0-9_-]*$/;
const NAME_ERROR = ["Please enter a username matching the regular expression", "configured via the NAME_REGEX configuration variable."];

type ParsedArgs = { operands: string[]; gid?: number; error?: string };

/** Optionen wie bei Debian: --gid N, --ingroup G, --disabled-password, --gecos TEXT */
function parseArgs(command: string, args: string[]): ParsedArgs {
    const operands: string[] = [];
    let gid: number | undefined;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--gid" || arg === "--uid") {
            const value = args[++i];
            if (!value || !/^\d+$/.test(value)) return { operands, error: `${command}: option '${arg}' requires a numeric argument` };
            if (arg === "--gid") gid = parseInt(value, 10);
        } else if (arg === "--gecos" || arg === "--ingroup" || arg === "--home" || arg === "--shell") {
            i++;
        } else if (arg.startsWith("-")) {
            // --disabled-password, --system usw. werden akzeptiert und ignoriert
        } else {
            operands.push(arg);
        }
    }
    return { operands, gid };
}

/** Erste freie Nummer ab 1000, die weder als UID noch als GID vergeben ist */
function freeId(state: ShellStateModel): number {
    const used = new Set([...state.fs.users.map((user) => user.uid), ...state.fs.groups.map((group) => group.gid)]);
    let id = 1000;
    while (used.has(id)) id++;
    return id;
}

export function addToGroup(command: string, state: ShellStateModel, userName: string, groupName: string): string[] {
    const user = state.fs.findUser(userName);
    const group = state.fs.findGroup(groupName);
    if (!user) return [`${command}: The user \`${userName}' does not exist.`];
    if (!group) return [`${command}: The group \`${groupName}' does not exist.`];

    if (group.members.includes(userName) || user.primaryGroup === groupName) {
        return [`${command}: The user \`${userName}' is already a member of \`${groupName}'.`];
    }
    group.members.push(userName);
    refreshSystemFiles(state.fs);
    return [`Adding user \`${userName}' to group \`${groupName}' ...`, "Done."];
}

/**
 * Neue Gruppe anlegen. Dateien, die bisher nur die Nummer als Gruppe hatten
 * (z. B. "2011"), zeigen danach den Namen an – wie unter Linux, wo nur die GID gespeichert ist.
 */
export function createGroup(command: string, state: ShellStateModel, groupName: string, gid?: number): string[] {
    if (!NAME_PATTERN.test(groupName)) return [`${command}: ${NAME_ERROR[0]}`, NAME_ERROR[1]];
    if (state.fs.findGroup(groupName)) return [`${command}: The group \`${groupName}' already exists.`];
    if (gid !== undefined && state.fs.groups.some((group) => group.gid === gid)) {
        return [`${command}: The GID ${gid} is already in use.`];
    }

    const id = gid ?? freeId(state);
    state.fs.groups.push({ name: groupName, gid: id, members: [] });
    for (const node of state.fs.allNodes()) {
        if (node.group === String(id)) node.group = groupName;
    }
    refreshSystemFiles(state.fs);
    return [`Adding group \`${groupName}' (GID ${id}) ...`, "Done."];
}

function createUser(state: ShellStateModel, userName: string, gid?: number): string[] {
    if (!NAME_PATTERN.test(userName)) return [`adduser: ${NAME_ERROR[0]}`, NAME_ERROR[1]];
    if (state.fs.findUser(userName)) return [`adduser: The user \`${userName}' already exists.`];

    const lines = [`Adding user \`${userName}' ...`];
    let primaryGroup: string;
    let uid: number;

    if (gid !== undefined) {
        const group = state.fs.groups.find((entry) => entry.gid === gid);
        if (!group) return [`adduser: The group with GID ${gid} does not exist.`];
        primaryGroup = group.name;
        uid = freeId(state);
        lines.push(`Adding new user \`${userName}' (${uid}) with group \`${primaryGroup} (${gid})' ...`);
    } else {
        uid = freeId(state);
        primaryGroup = userName;
        state.fs.groups.push({ name: userName, gid: uid, members: [] });
        lines.push(`Adding new group \`${userName}' (${uid}) ...`, `Adding new user \`${userName}' (${uid}) with group \`${userName} (${uid})' ...`);
    }

    const home = `/home/${userName}`;
    state.fs.users.push({ name: userName, uid, primaryGroup, home });

    const homeParent = state.fs.getNode("/home");
    if (homeParent && !homeParent.children?.[userName]) {
        state.fs.addChild(homeParent, {
            name: userName,
            type: "directory",
            owner: userName,
            group: primaryGroup,
            mode: 0o750,
            modified: Date.now(),
            children: {},
        });
    }
    refreshSystemFiles(state.fs);
    lines.push(`Creating home directory \`${home}' ...`, "(Simulation) Passwort und Benutzerinfos übersprungen.", "Done.");
    return lines;
}

export const adduserCommand: Command = (args, state) => {
    const { operands, gid, error } = parseArgs("adduser", args);
    if (error) return { lines: [error] };
    if (state.user !== "root") return { lines: ["adduser: Only root may add a user or group to the system."] };
    if (operands.length === 0) return { lines: ["adduser: Only one or two names allowed."] };
    if (operands.length > 2) return { lines: ["adduser: Specify only one name in this mode."] };

    return {
        lines: operands.length === 2 ? addToGroup("adduser", state, operands[0], operands[1]) : createUser(state, operands[0], gid),
    };
};

/** addgroup [--gid N] gruppe  bzw.  addgroup benutzer gruppe */
export const addgroupCommand: Command = (args, state) => {
    const { operands, gid, error } = parseArgs("addgroup", args);
    if (error) return { lines: [error] };
    if (state.user !== "root") return { lines: ["addgroup: Only root may add a user or group to the system."] };
    if (operands.length === 0) return { lines: ["addgroup: Only one or two names allowed."] };
    if (operands.length > 2) return { lines: ["addgroup: Specify only one name in this mode."] };

    return {
        lines: operands.length === 2 ? addToGroup("addgroup", state, operands[0], operands[1]) : createGroup("addgroup", state, operands[0], gid),
    };
};
