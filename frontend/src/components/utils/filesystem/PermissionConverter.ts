import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";

const CLASSES: { shift: number; specialBit: number; specialChar: string }[] = [
    { shift: 6, specialBit: 0o4000, specialChar: "s" }, // Besitzer, SUID
    { shift: 3, specialBit: 0o2000, specialChar: "s" }, // Gruppe, SGID
    { shift: 0, specialBit: 0o1000, specialChar: "t" }, // others, Sticky
];

/** 0o2775 (Verzeichnis) -> "drwxrwsr-x" */
export function modeToString(node: FileSystemNodeModel): string {
    let result = node.type === "directory" ? "d" : "-";

    for (const { shift, specialBit, specialChar } of CLASSES) {
        const bits = (node.mode >> shift) & 0o7;
        result += bits & 4 ? "r" : "-";
        result += bits & 2 ? "w" : "-";

        const execute = (bits & 1) !== 0;
        if (node.mode & specialBit) {
            result += execute ? specialChar : specialChar.toUpperCase();
        } else {
            result += execute ? "x" : "-";
        }
    }
    return result;
}
