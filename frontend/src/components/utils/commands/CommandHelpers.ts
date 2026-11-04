import type { CommandResultModel } from "../../models/CommandResultModel.ts";
import type { FileSystemNodeModel, NodeType } from "../../models/FileSystemNodeModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { hasPermission, type Access } from "../filesystem/PermissionCheck.ts";
import { baseName, parentPath } from "../filesystem/PathResolver.ts";
import type { FileSystemError } from "../filesystem/VirtualFileSystem.ts";

export function can(state: ShellStateModel, node: FileSystemNodeModel, access: Access): boolean {
    return hasPermission(state.user, state.groups, node, access);
}

export function usageError(command: string, message: string): CommandResultModel {
    return { lines: [`${command}: ${message}`, `Try '${command} --help' for more information.`] };
}

export type CreateTarget =
    | { ok: true; parent: FileSystemNodeModel; name: string; existing?: FileSystemNodeModel }
    | { ok: false; error: FileSystemError };

/** Elternordner für einen neuen Eintrag prüfen: muss existieren, Verzeichnis sein, w und x haben */
export function prepareCreate(state: ShellStateModel, path: string): CreateTarget {
    const parentResult = state.fs.lookup(parentPath(path), state.user, state.groups);
    if (!parentResult.ok) return parentResult;

    const parent = parentResult.node;
    if (parent.type !== "directory") return { ok: false, error: "ENOTDIR" };

    const name = baseName(path);
    const existing = parent.children?.[name];
    if (existing) return { ok: true, parent, name, existing };

    if (!can(state, parent, "w") || !can(state, parent, "x")) return { ok: false, error: "EACCES" };
    return { ok: true, parent, name };
}

/**
 * Neuen Eintrag anlegen wie Linux:
 * - Besitzer: aktueller Benutzer
 * - Gruppe: bei SGID am Elternordner dessen Gruppe, sonst Primärgruppe
 * - Rechte: Ausgangsrechte minus umask, Verzeichnisse erben SGID
 */
export function createNode(
    state: ShellStateModel,
    parent: FileSystemNodeModel,
    name: string,
    type: NodeType,
    baseMode: number,
    content = "",
): FileSystemNodeModel {
    const inheritsGroup = (parent.mode & 0o2000) !== 0;
    const node: FileSystemNodeModel = {
        name,
        type,
        owner: state.user,
        group: inheritsGroup ? parent.group : state.groups[0] ?? state.user,
        mode: (baseMode & 0o777 & ~state.umask) | (inheritsGroup && type === "directory" ? 0o2000 : 0),
        modified: Date.now(),
    };
    if (type === "directory") {
        node.children = {};
    } else {
        node.content = content;
    }
    state.fs.addChild(parent, node);
    return node;
}

/** Sticky-Bit (/tmp): Löschen/Umbenennen nur für Besitzer der Datei, des Ordners oder root */
export function stickyBlocks(state: ShellStateModel, parent: FileSystemNodeModel, node: FileSystemNodeModel): boolean {
    if (!(parent.mode & 0o1000) || state.user === "root") return false;
    return state.user !== node.owner && state.user !== parent.owner;
}

export function removeChild(parent: FileSystemNodeModel, name: string): void {
    if (parent.children) delete parent.children[name];
    parent.modified = Date.now();
}

/** Entfernt ANSI-Farbcodes, z. B. für Umleitungen in Dateien */
export function stripColors(text: string): string {
    // eslint-disable-next-line no-control-regex
    return text.replace(/\x1b\[[0-9;]*m/g, "");
}
