import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";
import type { GroupModel } from "../../models/GroupModel.ts";
import type { UserModel } from "../../models/UserModel.ts";
import { hasPermission } from "./PermissionCheck.ts";
import { splitPath } from "./PathResolver.ts";

export type FileSystemError = "ENOENT" | "ENOTDIR" | "EACCES" | "EEXIST";

export type LookupResult =
    | { ok: true; node: FileSystemNodeModel }
    | { ok: false; error: FileSystemError };

const ERROR_MESSAGES: Record<FileSystemError, string> = {
    ENOENT: "No such file or directory",
    ENOTDIR: "Not a directory",
    EACCES: "Permission denied",
    EEXIST: "File exists",
};

export function errorMessage(error: FileSystemError): string {
    return ERROR_MESSAGES[error];
}

export class VirtualFileSystem {
    root: FileSystemNodeModel;
    users: UserModel[];
    groups: GroupModel[];

    constructor(root: FileSystemNodeModel, users: UserModel[], groups: GroupModel[]) {
        this.root = root;
        this.users = users;
        this.groups = groups;
    }

    findUser(name: string): UserModel | undefined {
        return this.users.find((user) => user.name === name);
    }

    findGroup(name: string): GroupModel | undefined {
        return this.groups.find((group) => group.name === name);
    }

    /** Primärgruppe zuerst, danach alle weiteren Gruppen */
    groupsOfUser(name: string): string[] {
        const user = this.findUser(name);
        if (!user) return [];
        const others = this.groups
            .filter((group) => group.members.includes(name) && group.name !== user.primaryGroup)
            .map((group) => group.name);
        return [user.primaryGroup, ...others];
    }

    /** Knoten ohne Rechteprüfung holen */
    getNode(absolutePath: string): FileSystemNodeModel | undefined {
        let node: FileSystemNodeModel | undefined = this.root;
        for (const part of splitPath(absolutePath)) {
            node = node?.children?.[part];
            if (!node) return undefined;
        }
        return node;
    }

    /**
     * Knoten mit Rechteprüfung holen, wie der Linux-Kernel:
     * Für jedes Verzeichnis auf dem Weg braucht man x.
     */
    lookup(absolutePath: string, user: string, groups: string[]): LookupResult {
        let node = this.root;
        for (const part of splitPath(absolutePath)) {
            if (node.type !== "directory") return { ok: false, error: "ENOTDIR" };
            if (!hasPermission(user, groups, node, "x")) return { ok: false, error: "EACCES" };

            const child = node.children?.[part];
            if (!child) return { ok: false, error: "ENOENT" };
            node = child;
        }
        return { ok: true, node };
    }

    addChild(parent: FileSystemNodeModel, child: FileSystemNodeModel): void {
        parent.children ??= {};
        parent.children[child.name] = child;
        parent.modified = Date.now();
    }
}
