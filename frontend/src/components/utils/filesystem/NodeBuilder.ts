import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";

export const START_DATE = new Date(2026, 10, 3, 9, 15).getTime();

/** Datum für ls -l, Monat wie in JavaScript ab 0 (10 = November) */
export function date(month: number, day: number, hour: number, minute: number): number {
    return new Date(2026, month, day, hour, minute).getTime();
}

export function dir(
    name: string,
    owner: string,
    group: string,
    mode: number,
    children: FileSystemNodeModel[] = [],
    modified = START_DATE,
): FileSystemNodeModel {
    return {
        name,
        type: "directory",
        owner,
        group,
        mode,
        modified,
        children: Object.fromEntries(children.map((child) => [child.name, child])),
    };
}

export function file(
    name: string,
    owner: string,
    group: string,
    mode: number,
    content = "",
    modified = START_DATE,
): FileSystemNodeModel {
    return { name, type: "file", owner, group, mode, modified, content };
}

/** Text auf eine bestimmte Länge auffüllen, damit ls -l die gewünschte Größe zeigt */
export function sized(text: string, size: number): string {
    if (text.length >= size) return text.slice(0, size);
    return text + ".".repeat(size - text.length - 1) + "\n";
}
