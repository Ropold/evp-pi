import type { Command, CommandResultModel } from "../../models/CommandResultModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { openSession } from "../SessionManager.ts";
import { runCommand } from "./CommandRegistry.ts";

const USAGE = ["usage: sudo [-u user] command", "usage: sudo -i"];

/** Befehl mit den Rechten eines anderen Benutzers ausführen, danach zurück */
function runAs(state: ShellStateModel, user: string, name: string, args: string[]): CommandResultModel {
    const saved = { user: state.user, groups: state.groups };
    const sessionsBefore = state.previousSessions.length;

    state.user = user;
    state.groups = state.fs.groupsOfUser(user);
    const result = runCommand(name, args, state, "sudo");

    // Hat der Befehl eine neue Sitzung geöffnet (z. B. sudo su), nicht zurücksetzen
    if (state.previousSessions.length === sessionsBefore) {
        state.user = saved.user;
        state.groups = saved.groups;
    } else {
        state.previousSessions[sessionsBefore] = { ...state.previousSessions[sessionsBefore], ...saved };
    }
    return result;
}

export const sudoCommand: Command = (args, state) => {
    if (args.length === 0) return { lines: USAGE };

    if (state.user !== "root" && !state.groups.includes("sudo")) {
        return { lines: [`${state.user} is not in the sudoers file.  This incident will be reported.`] };
    }

    let targetUser = "root";
    let rest = args;
    if (rest[0] === "-u") {
        targetUser = rest[1] ?? "";
        rest = rest.slice(2);
        if (!state.fs.findUser(targetUser)) return { lines: [`sudo: unknown user ${targetUser}`] };
    }

    if (rest[0] === "-i" || rest[0] === "-s") {
        openSession(state, targetUser, "su", rest[0] === "-s");
        return { lines: [] };
    }
    if (rest.length === 0) return { lines: USAGE };
    // cd ist in die Shell eingebaut, sudo findet dafür kein Programm
    if (rest[0] === "cd") return { lines: ["sudo: cd: command not found"] };

    return runAs(state, targetUser, rest[0], rest.slice(1));
};
