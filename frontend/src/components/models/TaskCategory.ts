/** Die Abschnitte der Kannliste */
export type TaskCategory = "login" | "users" | "readPermissions" | "changePermissions" | "sgid" | "files" | "access";

export const TASK_CATEGORIES: TaskCategory[] = [
    "login",
    "users",
    "readPermissions",
    "changePermissions",
    "sgid",
    "files",
    "access",
];

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
    login: "Anmelden und Orientieren",
    users: "Benutzer und Gruppen",
    readPermissions: "Rechte lesen",
    changePermissions: "Rechte und Eigentümer ändern",
    sgid: "SGID-Bit",
    files: "Dateien und Verzeichnisse verwalten",
    access: "Zugriff analysieren",
};
