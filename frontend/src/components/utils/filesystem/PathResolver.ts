/** Zerlegt einen absoluten Pfad in seine Teile: "/home/anna" -> ["home", "anna"] */
export function splitPath(absolutePath: string): string[] {
    return absolutePath.split("/").filter((part) => part.length > 0);
}

export function joinPath(parts: string[]): string {
    return "/" + parts.join("/");
}

/** Macht aus einer Eingabe (relativ oder absolut) einen normalisierten absoluten Pfad. */
export function resolvePath(cwd: string, input: string): string {
    const start = input.startsWith("/") ? [] : splitPath(cwd);
    const parts = [...start];

    for (const part of input.split("/")) {
        if (part === "" || part === ".") continue;
        if (part === "..") {
            parts.pop();
        } else {
            parts.push(part);
        }
    }
    return joinPath(parts);
}

export function parentPath(absolutePath: string): string {
    return joinPath(splitPath(absolutePath).slice(0, -1));
}

export function baseName(absolutePath: string): string {
    const parts = splitPath(absolutePath);
    return parts.length === 0 ? "/" : parts[parts.length - 1];
}

/** Pfad für den Prompt: Home wird zu "~". */
export function displayPath(cwd: string, home: string): string {
    if (cwd === home) return "~";
    if (home !== "/" && cwd.startsWith(home + "/")) return "~" + cwd.slice(home.length);
    return cwd;
}
