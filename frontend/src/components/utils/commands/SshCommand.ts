import type { Command } from "../../models/CommandResultModel.ts";
import { findHost, openSession } from "../SessionManager.ts";

export const sshCommand: Command = (args, state) => {
    const target = args.find((arg) => !arg.startsWith("-"));
    if (!target) {
        return { lines: ["usage: ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-l login_name] [-p port]", "           destination [command]"] };
    }

    const at = target.lastIndexOf("@");
    const user = at >= 0 ? target.slice(0, at) : state.user;
    const hostName = at >= 0 ? target.slice(at + 1) : target;

    const host = findHost(hostName);
    if (!host) return { lines: [`ssh: Could not resolve hostname ${hostName}: Name or service not known`] };
    if (!host.reachable) return { lines: [`ssh: connect to host ${hostName} port 22: No route to host`] };
    if (!host.isLocal) return { lines: [`ssh: connect to host ${hostName} port 22: Connection refused`] };
    if (!state.fs.findUser(user)) return { lines: [`${user}@${hostName}: Permission denied (publickey,password).`] };

    openSession(state, user, "ssh");
    return {
        lines: [
            "Welcome to pi (simuliertes Ubuntu, kein Passwort nötig)",
            "",
            `Angemeldet als ${user}. Mit exit zurück.`,
        ],
    };
};
