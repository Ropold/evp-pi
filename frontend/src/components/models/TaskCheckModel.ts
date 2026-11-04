/**
 * Prüfregel einer Aufgabe. Terminal-Aufgaben prüfen den Zustand nach jedem Befehl,
 * Fragen vergleichen die Antwort.
 */
export type TaskCheckModel =
    /** Rechte inkl. Spezialbits, oktal, z. B. "700" oder "2775" */
    | { type: "mode"; path: string; mode: string }
    | { type: "owner"; path: string; owner?: string; group?: string }
    | { type: "exists"; path: string; nodeType?: "file" | "directory" }
    | { type: "notExists"; path: string }
    | { type: "cwd"; path: string }
    /** Laut /etc/group (nicht nur Sitzung) */
    | { type: "groupMember"; user: string; group: string }
    /** Angemeldeter Benutzer der aktuellen Sitzung */
    | { type: "sessionUser"; user: string }
    /** Regulärer Ausdruck auf den zuletzt eingegebenen Befehl */
    | { type: "command"; pattern: string }
    /** Antwort auf eine Frage, Groß/Klein und Leerzeichen egal */
    | { type: "answer"; accepted: string[] }
    | { type: "all"; checks: TaskCheckModel[] };
