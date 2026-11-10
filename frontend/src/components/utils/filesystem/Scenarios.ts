import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";
import type { GroupModel } from "../../models/GroupModel.ts";
import type { UserModel } from "../../models/UserModel.ts";
import { date, dir, file, sized } from "./NodeBuilder.ts";

/**
 * Ausgangssysteme für die Aufgaben:
 * - kannliste: Raspberry Pi "pi" für den Übungsmodus
 * - uebung1: Webserver "web01" (Probeklausur, eigene Aufgaben zur Kannliste)
 * - uebung2: Server "srv01" der NetzWerk GmbH (Übung 2)
 * - uebung3: Raspberry Pi "lightning" (Klausurübung, Übung 3)
 */
export type ScenarioName = "kannliste" | "uebung1" | "uebung2" | "uebung3";

export type ScenarioModel = {
    hostname: string;
    root: FileSystemNodeModel;
    users: UserModel[];
    groups: GroupModel[];
    /** umask je Benutzer, sonst defaultUmask (root immer 0022) */
    umasks: Record<string, number>;
    defaultUmask: number;
};

const BASHRC = "# ~/.bashrc\nalias ll='ls -la'\n";

function etc(hostname: string): FileSystemNodeModel {
    return dir("etc", "root", "root", 0o755, [
        file("hostname", "root", "root", 0o644, `${hostname}\n`),
        file("passwd", "root", "root", 0o644),
        file("group", "root", "root", 0o644),
        file("shadow", "root", "shadow", 0o640),
    ]);
}

function home(user: string, mode: number, children: FileSystemNodeModel[] = []): FileSystemNodeModel {
    return dir(user, user, user, mode, [file(".bashrc", user, user, 0o644, BASHRC), ...children]);
}

function kannliste(): ScenarioModel {
    return {
        hostname: "pi",
        umasks: {},
        defaultUmask: 0o002,
        users: [
            { name: "root", uid: 0, primaryGroup: "root", home: "/root" },
            { name: "anna", uid: 1000, primaryGroup: "anna", home: "/home/anna" },
            { name: "ben", uid: 1001, primaryGroup: "ben", home: "/home/ben" },
            { name: "clara", uid: 1002, primaryGroup: "clara", home: "/home/clara" },
        ],
        groups: [
            { name: "root", gid: 0, members: [] },
            { name: "sudo", gid: 27, members: ["anna"] },
            { name: "shadow", gid: 42, members: [] },
            { name: "anna", gid: 1000, members: [] },
            { name: "ben", gid: 1001, members: [] },
            { name: "clara", gid: 1002, members: [] },
            { name: "team", gid: 1100, members: ["anna", "ben"] },
        ],
        root: dir("", "root", "root", 0o755, [
            etc("pi"),
            dir("home", "root", "root", 0o755, [
                home("anna", 0o750, [
                    file("notizen.txt", "anna", "anna", 0o644, "Kannliste wiederholen\n"),
                    dir("dokumente", "anna", "anna", 0o755, [
                        file("bericht.txt", "anna", "anna", 0o640, "Quartalsbericht\n"),
                    ]),
                ]),
                home("ben", 0o750, [file("todo.txt", "ben", "ben", 0o600, "Server patchen\n")]),
                home("clara", 0o750),
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
        ]),
    };
}

/**
 * Übung 1 (Probeklausur): Webagentur PixelWerk, Server web01.
 * kim ist Admin (sudo), lena Designerin, max Entwickler, jonas Praktikant (nur seine Primärgruppe).
 */
function uebung1(): ScenarioModel {
    return {
        hostname: "web01",
        umasks: { kim: 0o022, lena: 0o002, max: 0o002, jonas: 0o002 },
        defaultUmask: 0o002,
        users: [
            { name: "root", uid: 0, primaryGroup: "root", home: "/root" },
            { name: "kim", uid: 1001, primaryGroup: "kim", home: "/home/kim" },
            { name: "lena", uid: 1002, primaryGroup: "lena", home: "/home/lena" },
            { name: "max", uid: 1003, primaryGroup: "max", home: "/home/max" },
            { name: "jonas", uid: 1004, primaryGroup: "jonas", home: "/home/jonas" },
        ],
        groups: [
            { name: "root", gid: 0, members: [] },
            { name: "sudo", gid: 27, members: ["kim"] },
            { name: "shadow", gid: 42, members: [] },
            { name: "kim", gid: 1001, members: [] },
            { name: "lena", gid: 1002, members: [] },
            { name: "max", gid: 1003, members: [] },
            { name: "jonas", gid: 1004, members: [] },
            { name: "web", gid: 1100, members: ["lena", "max"] },
            { name: "kunden", gid: 1101, members: ["kim"] },
        ],
        root: dir("", "root", "root", 0o755, [
            etc("web01"),
            dir("home", "root", "root", 0o755, [
                home("kim", 0o750),
                home("lena", 0o750, [file("entwurf.css", "lena", "lena", 0o664, sized("body { margin: 0; }\n", 512), date(10, 5, 8, 40))]),
                home("max", 0o750, [file("deploy.sh", "max", "max", 0o744, "#!/bin/bash\necho deploy\n", date(10, 4, 16, 2))]),
                home("jonas", 0o750, [file("fragen.txt", "jonas", "jonas", 0o644, "Was macht umask?\n", date(10, 6, 7, 55))]),
            ]),
            dir(
                "var",
                "root",
                "root",
                0o755,
                [
                    dir(
                        "www",
                        "root",
                        "web",
                        0o750,
                        [
                            dir(
                                "shop",
                                "max",
                                "web",
                                0o2770,
                                [
                                    file("index.html", "lena", "web", 0o664, sized("<!doctype html>\n", 1840), date(10, 5, 9, 12)),
                                    file("config.php", "max", "web", 0o640, sized("<?php // db\n", 420), date(10, 5, 9, 30)),
                                ],
                                date(10, 5, 9, 30),
                            ),
                            dir(
                                "kunden",
                                "kim",
                                "kunden",
                                0o770,
                                [file("vertrag.txt", "kim", "kunden", 0o660, sized("Vertrag\n", 2200), date(10, 2, 11, 5))],
                                date(10, 2, 11, 5),
                            ),
                            dir("logs", "root", "web", 0o750, [file("access.log", "root", "web", 0o640, sized("GET /\n", 9000), date(10, 9, 23, 59))], date(10, 9, 23, 59)),
                        ],
                        date(10, 1, 10, 0),
                    ),
                ],
                date(10, 1, 10, 0),
            ),
            dir("root", "root", "root", 0o700),
            dir("tmp", "root", "root", 0o1777),
        ]),
    };
}

/** Übung 2: Ausgangslage vor Teil 2 (tim ist noch nicht in projekt, ben noch nicht in extern) */
function uebung2(): ScenarioModel {
    return {
        hostname: "srv01",
        umasks: { tim: 0o027 },
        defaultUmask: 0o022,
        users: [
            { name: "root", uid: 0, primaryGroup: "root", home: "/root" },
            { name: "anna", uid: 1001, primaryGroup: "anna", home: "/home/anna" },
            { name: "ben", uid: 1002, primaryGroup: "ben", home: "/home/ben" },
            { name: "carla", uid: 1003, primaryGroup: "carla", home: "/home/carla" },
            { name: "tim", uid: 1004, primaryGroup: "tim", home: "/home/tim" },
        ],
        groups: [
            { name: "root", gid: 0, members: [] },
            { name: "sudo", gid: 27, members: ["tim"] },
            { name: "shadow", gid: 42, members: [] },
            { name: "anna", gid: 1001, members: [] },
            { name: "ben", gid: 1002, members: [] },
            { name: "carla", gid: 1003, members: [] },
            { name: "tim", gid: 1004, members: [] },
            { name: "projekt", gid: 1010, members: ["anna", "ben"] },
            { name: "extern", gid: 1011, members: ["carla"] },
        ],
        root: dir("", "root", "root", 0o755, [
            etc("srv01"),
            dir("home", "root", "root", 0o755, [
                home("anna", 0o750),
                home("ben", 0o750),
                home("carla", 0o750),
                home("tim", 0o750, [
                    file("bericht.txt", "tim", "tim", 0o640, sized("Bericht Praktikum\n", 733), date(10, 7, 14, 10)),
                    file("notiz.txt", "tim", "tim", 0o640, "Projekt-Notizen\n", date(10, 7, 14, 12)),
                    file("weitergabe.txt", "tim", "tim", 0o644, "Zur Weitergabe\n", date(10, 7, 14, 20)),
                    file("entwurf.txt", "tim", "projekt", 0o640, sized("Entwurf\n", 640), date(10, 10, 8, 30)),
                    dir("material", "tim", "tim", 0o755, [], date(10, 7, 14, 30)),
                ]),
            ]),
            dir("srv", "root", "root", 0o755, [
                dir(
                    "projekt",
                    "root",
                    "projekt",
                    0o750,
                    [
                        dir("austausch", "anna", "extern", 0o770, [], date(10, 3, 9, 20)),
                        dir(
                            "code",
                            "ben",
                            "projekt",
                            0o770,
                            [dir("build", "ben", "projekt", 0o755, [], date(10, 3, 9, 12))],
                            date(10, 3, 9, 12),
                        ),
                        dir(
                            "doku",
                            "anna",
                            "projekt",
                            0o770,
                            [
                                dir("archiv", "anna", "projekt", 0o770, [], date(10, 2, 16, 48)),
                                file("budget.txt", "anna", "projekt", 0o460, sized("Budget 2026\n", 1520), date(10, 4, 14, 20)),
                                file("konzept.txt", "anna", "anna", 0o644, sized("Konzept\n", 2048), date(10, 3, 10, 15)),
                            ],
                            date(10, 2, 16, 48),
                        ),
                    ],
                    date(10, 2, 8, 0),
                ),
            ]),
            dir("root", "root", "root", 0o700),
            dir("tmp", "root", "root", 0o1777),
        ]),
    };
}

/**
 * Übung 3: Ausgangsszenario wie setup_rechte_uebung.sh.
 * Gruppe tools, Benutzer hklaus und /srv/projekte fehlen absichtlich (V1–V3).
 * /srv/tools gehört numerisch der GID 2011, bis die Gruppe angelegt wird.
 */
function uebung3(): ScenarioModel {
    return {
        hostname: "lightning",
        umasks: {},
        defaultUmask: 0o022,
        users: [
            { name: "root", uid: 0, primaryGroup: "root", home: "/root" },
            { name: "mkeller", uid: 1001, primaryGroup: "mkeller", home: "/home/mkeller" },
            { name: "bwagner", uid: 1002, primaryGroup: "bwagner", home: "/home/bwagner" },
            { name: "zturner", uid: 1003, primaryGroup: "zturner", home: "/home/zturner" },
            { name: "fweber", uid: 1004, primaryGroup: "fweber", home: "/home/fweber" },
        ],
        groups: [
            { name: "root", gid: 0, members: [] },
            { name: "sudo", gid: 27, members: ["zturner", "fweber", "mkeller"] },
            { name: "shadow", gid: 42, members: [] },
            { name: "zturner", gid: 1003, members: [] },
            { name: "fweber", gid: 1004, members: [] },
            { name: "mkeller", gid: 2001, members: [] },
            { name: "bwagner", gid: 2002, members: [] },
            { name: "technik", gid: 2010, members: ["mkeller", "bwagner"] },
        ],
        root: dir("", "root", "root", 0o755, [
            etc("lightning"),
            dir("home", "root", "technik", 0o755, [
                home("mkeller", 0o755),
                home("bwagner", 0o755),
                home("zturner", 0o755),
                home("fweber", 0o755),
            ]),
            // Diagramm: rwx r-- r-- = 744 (das Setup-Skript setzt fälschlich 754 = rwxr-xr--)
            dir("srv", "root", "technik", 0o744, [dir("tools", "root", "2011", 0o755)]),
            dir("root", "root", "root", 0o700),
            dir("tmp", "root", "root", 0o1777),
        ]),
    };
}

export const SCENARIOS: Record<ScenarioName, () => ScenarioModel> = { kannliste, uebung1, uebung2, uebung3 };
