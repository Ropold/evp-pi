import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";
import type { GroupModel } from "../../models/GroupModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import type { UserModel } from "../../models/UserModel.ts";
import { VirtualFileSystem } from "./VirtualFileSystem.ts";
import { newSession } from "../SessionManager.ts";

const START_DATE = new Date(2026, 10, 3, 9, 15).getTime();

function dir(
    name: string,
    owner: string,
    group: string,
    mode: number,
    children: FileSystemNodeModel[] = [],
): FileSystemNodeModel {
    return {
        name,
        type: "directory",
        owner,
        group,
        mode,
        modified: START_DATE,
        children: Object.fromEntries(children.map((child) => [child.name, child])),
    };
}

function file(
    name: string,
    owner: string,
    group: string,
    mode: number,
    content = "",
): FileSystemNodeModel {
    return { name, type: "file", owner, group, mode, modified: START_DATE, content };
}

const USERS: UserModel[] = [
    { name: "root", uid: 0, primaryGroup: "root", home: "/root" },
    { name: "anna", uid: 1000, primaryGroup: "anna", home: "/home/anna" },
    { name: "ben", uid: 1001, primaryGroup: "ben", home: "/home/ben" },
    { name: "clara", uid: 1002, primaryGroup: "clara", home: "/home/clara" },
];

const GROUPS: GroupModel[] = [
    { name: "root", gid: 0, members: [] },
    { name: "sudo", gid: 27, members: ["anna"] },
    { name: "shadow", gid: 42, members: [] },
    { name: "anna", gid: 1000, members: [] },
    { name: "ben", gid: 1001, members: [] },
    { name: "clara", gid: 1002, members: [] },
    { name: "team", gid: 1100, members: ["anna", "ben"] },
];

const BASHRC = "# ~/.bashrc\nalias ll='ls -la'\n";

function createRoot(): FileSystemNodeModel {
    return dir("", "root", "root", 0o755, [
        dir("etc", "root", "root", 0o755, [
            file("hostname", "root", "root", 0o644, "pi\n"),
            file("passwd", "root", "root", 0o644),
            file("group", "root", "root", 0o644),
            file("shadow", "root", "shadow", 0o640),
        ]),
        dir("home", "root", "root", 0o755, [
            dir("anna", "anna", "anna", 0o750, [
                file(".bashrc", "anna", "anna", 0o644, BASHRC),
                file("notizen.txt", "anna", "anna", 0o644, "Kannliste wiederholen\n"),
                dir("dokumente", "anna", "anna", 0o755, [
                    file("bericht.txt", "anna", "anna", 0o640, "Quartalsbericht\n"),
                ]),
            ]),
            dir("ben", "ben", "ben", 0o750, [
                file(".bashrc", "ben", "ben", 0o644, BASHRC),
                file("todo.txt", "ben", "ben", 0o600, "Server patchen\n"),
            ]),
            dir("clara", "clara", "clara", 0o750, [
                file(".bashrc", "clara", "clara", 0o644, BASHRC),
            ]),
        ]),
        dir("projekt", "root", "team", 0o2775, [
            file("plan.txt", "anna", "team", 0o664, "Meilensteine\n"),
            dir("protokolle", "ben", "team", 0o2770, [
                file("sitzung-01.txt", "ben", "team", 0o660, "Protokoll 1\n"),
            ]),
            dir("archiv", "root", "root", 0o700),
        ]),
        dir("root", "root", "root", 0o700),
        dir("tmp", "root", "root", 0o1777),
    ]);
}

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

export function createFileSystem(): VirtualFileSystem {
    const fs = new VirtualFileSystem(
        createRoot(),
        USERS.map((user) => ({ ...user })),
        GROUPS.map((group) => ({ ...group, members: [...group.members] })),
    );
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
        hostname: "pi",
        openedBy: "login",
    };
    return Object.assign(state, newSession(state, user, "login"));
}
