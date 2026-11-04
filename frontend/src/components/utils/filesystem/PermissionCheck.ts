import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";

export type Access = "r" | "w" | "x";

const ACCESS_BITS: Record<Access, number> = { r: 4, w: 2, x: 1 };

/**
 * Prüft ein Recht wie Linux:
 * - root darf alles (außer Dateien ausführen, die für niemanden ausführbar sind)
 * - sonst zählt genau EINE Klasse: Besitzer, sonst Gruppe, sonst others
 */
export function hasPermission(
    user: string,
    groups: string[],
    node: FileSystemNodeModel,
    access: Access,
): boolean {
    if (user === "root") {
        if (access === "x" && node.type === "file") return (node.mode & 0o111) !== 0;
        return true;
    }

    let shift = 0;
    if (node.owner === user) {
        shift = 6;
    } else if (groups.includes(node.group)) {
        shift = 3;
    }
    return ((node.mode >> shift) & ACCESS_BITS[access]) !== 0;
}
