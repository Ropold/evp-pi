import type { SessionModel, ShellStateModel } from "../models/ShellStateModel.ts";

export type HostModel = {
    name: string;
    ip: string;
    /** Antwortet auf ping */
    reachable: boolean;
    /** Ist dieser simulierte Rechner selbst (ssh möglich) */
    isLocal: boolean;
};

export const KNOWN_HOSTS: HostModel[] = [
    { name: "pi", ip: "192.168.0.42", reachable: true, isLocal: true },
    { name: "localhost", ip: "127.0.0.1", reachable: true, isLocal: true },
    { name: "server", ip: "192.168.0.10", reachable: true, isLocal: false },
    { name: "drucker", ip: "192.168.0.99", reachable: false, isLocal: false },
];

export function findHost(nameOrIp: string): HostModel | undefined {
    return KNOWN_HOSTS.find((host) => host.name === nameOrIp || host.ip === nameOrIp);
}

function snapshot(state: ShellStateModel): SessionModel {
    return {
        user: state.user,
        groups: [...state.groups],
        home: state.home,
        cwd: state.cwd,
        previousCwd: state.previousCwd,
        umask: state.umask,
        hostname: state.hostname,
        openedBy: state.openedBy,
    };
}

function applySession(state: ShellStateModel, session: SessionModel): void {
    Object.assign(state, session);
}

/** Neue Sitzung für einen Benutzer, Gruppen werden jetzt frisch gelesen */
export function newSession(state: ShellStateModel, user: string, openedBy: SessionModel["openedBy"]): SessionModel {
    const home = state.fs.findUser(user)?.home ?? "/";
    const homeExists = state.fs.getNode(home)?.type === "directory";
    return {
        user,
        groups: state.fs.groupsOfUser(user),
        home,
        cwd: homeExists ? home : "/",
        previousCwd: homeExists ? home : "/",
        umask: user === "root" ? 0o022 : 0o002,
        hostname: "pi",
        openedBy,
    };
}

/** su / ssh: aktuelle Sitzung merken und als anderer Benutzer weitermachen */
export function openSession(state: ShellStateModel, user: string, openedBy: "ssh" | "su", keepCwd = false): void {
    const cwd = state.cwd;
    state.previousSessions.push(snapshot(state));
    applySession(state, newSession(state, user, openedBy));
    if (keepCwd) state.cwd = cwd;
}

/** exit / logout */
export function closeSession(state: ShellStateModel): string[] {
    const closed = state.openedBy;
    const previous = state.previousSessions.pop();

    if (previous) {
        applySession(state, previous);
        return closed === "ssh" ? ["logout", "Connection to pi closed."] : ["exit"];
    }

    // Letzte Sitzung: wie Ab- und wieder Anmelden, Gruppen werden neu gelesen
    applySession(state, newSession(state, state.user, "login"));
    return ["logout", "", `(Simulation) Neu angemeldet als ${state.user}.`];
}
