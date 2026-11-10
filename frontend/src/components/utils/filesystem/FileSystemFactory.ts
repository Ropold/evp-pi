import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { VirtualFileSystem } from "./VirtualFileSystem.ts";
import { newSession } from "../SessionManager.ts";
import { SCENARIOS, type ScenarioName } from "./Scenarios.ts";

/** /etc/passwd und /etc/group aus Benutzern und Gruppen neu schreiben */
export function refreshSystemFiles(fs: VirtualFileSystem): void {
    const passwd = fs.getNode("/etc/passwd");
    if (passwd) {
        passwd.content = fs.users
            .map((user) => {
                const gid = fs.findGroup(user.primaryGroup)?.gid ?? user.uid;
                return `${user.name}:x:${user.uid}:${gid}::${user.home}:/bin/bash`;
            })
            .join("\n") + "\n";
    }
    const group = fs.getNode("/etc/group");
    if (group) {
        group.content = fs.groups
            .map((entry) => `${entry.name}:x:${entry.gid}:${entry.members.join(",")}`)
            .join("\n") + "\n";
    }
}

export function createFileSystem(scenario: ScenarioName = "kannliste"): VirtualFileSystem {
    const definition = SCENARIOS[scenario]();
    const fs = new VirtualFileSystem(definition.root, definition.users, definition.groups);
    fs.hostname = definition.hostname;
    fs.umasks = definition.umasks;
    fs.defaultUmask = definition.defaultUmask;
    refreshSystemFiles(fs);
    return fs;
}

/** Neue Sitzung: Gruppen werden jetzt festgelegt (wie beim Einloggen). */
export function createShellState(user = "anna", fs = createFileSystem()): ShellStateModel {
    const state: ShellStateModel = {
        fs,
        previousSessions: [],
        user,
        groups: [],
        home: "/",
        cwd: "/",
        previousCwd: "/",
        umask: 0o002,
        hostname: fs.hostname,
        openedBy: "login",
    };
    return Object.assign(state, newSession(state, user, "login"));
}
