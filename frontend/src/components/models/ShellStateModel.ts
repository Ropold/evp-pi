import type { VirtualFileSystem } from "../utils/filesystem/VirtualFileSystem.ts";

export type SessionModel = {
    user: string;
    /**
     * Gruppen der Sitzung. Werden beim Einloggen festgelegt,
     * deshalb wirkt eine Gruppenänderung erst nach erneutem Einloggen.
     */
    groups: string[];
    home: string;
    cwd: string;
    previousCwd: string;
    umask: number;
    hostname: string;
    /** Wie die Sitzung geöffnet wurde (für die Meldung bei exit) */
    openedBy: "login" | "ssh" | "su";
};

export type ShellStateModel = SessionModel & {
    fs: VirtualFileSystem;
    /** Frühere Sitzungen, zu denen `exit` zurückkehrt (nach ssh oder su) */
    previousSessions: SessionModel[];
};
