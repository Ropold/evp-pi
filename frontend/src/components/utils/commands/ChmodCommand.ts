import type { Command } from "../../models/CommandResultModel.ts";
import type { FileSystemNodeModel } from "../../models/FileSystemNodeModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { usageError } from "./CommandHelpers.ts";

const CLASS_SHIFT: Record<string, number> = { u: 6, g: 3, o: 0 };
const SPECIAL_BIT: Record<string, number> = { u: 0o4000, g: 0o2000 };

/**
 * Berechnet die neuen Rechte. Gibt null zurück, wenn der Modus ungültig ist.
 * Oktal: "750", "2775". Symbolisch: "u+x", "g+s", "o-rwx", "u=rwx,go=", "+x".
 */
export function applyMode(node: FileSystemNodeModel, modeText: string, umask: number): number | null {
    const isDirectory = node.type === "directory";

    if (/^[0-7]{1,4}$/.test(modeText)) {
        const value = parseInt(modeText, 8);
        // Wie GNU chmod: Bei 3 Ziffern bleiben SUID/SGID von Verzeichnissen erhalten
        const keepSpecial = isDirectory && modeText.length <= 3 ? node.mode & 0o6000 : 0;
        return value | keepSpecial;
    }

    let mode = node.mode & 0o7777;
    for (const clause of modeText.split(",")) {
        const match = /^([ugoa]*)((?:[-+=][rwxXst]*)+)$/.exec(clause);
        if (!match) return null;

        const whoText = match[1];
        const classes = whoText === "" || whoText.includes("a") ? ["u", "g", "o"] : [...new Set(whoText)];
        const useUmask = whoText === "";

        for (const [, operator, perms] of match[2].matchAll(/([-+=])([rwxXst]*)/g)) {
            let mask = 0;
            for (const cls of classes) {
                let bits = 0;
                if (perms.includes("r")) bits |= 4;
                if (perms.includes("w")) bits |= 2;
                if (perms.includes("x")) bits |= 1;
                if (perms.includes("X") && (isDirectory || (mode & 0o111) !== 0)) bits |= 1;
                mask |= bits << CLASS_SHIFT[cls];
                if (perms.includes("s") && SPECIAL_BIT[cls]) mask |= SPECIAL_BIT[cls];
                if (perms.includes("t") && cls === "o") mask |= 0o1000;
            }
            if (useUmask) mask &= ~umask | 0o7000;

            if (operator === "+") {
                mode |= mask;
            } else if (operator === "-") {
                mode &= ~mask;
            } else {
                let clearMask = 0;
                for (const cls of classes) {
                    clearMask |= 0o7 << CLASS_SHIFT[cls];
                    // Bei Verzeichnissen bleibt SUID/SGID erhalten, außer "s" wird angegeben
                    if (SPECIAL_BIT[cls] && (!isDirectory || perms.includes("s"))) clearMask |= SPECIAL_BIT[cls];
                    if (cls === "o") clearMask |= 0o1000;
                }
                mode = (mode & ~clearMask) | mask;
            }
        }
    }
    return mode;
}

function changeMode(
    state: ShellStateModel,
    node: FileSystemNodeModel,
    operand: string,
    modeText: string,
    recursive: boolean,
    lines: string[],
): void {
    if (state.user !== "root" && state.user !== node.owner) {
        lines.push(`chmod: changing permissions of '${operand}': Operation not permitted`);
        return;
    }

    let mode = applyMode(node, modeText, state.umask) ?? node.mode;
    // Wie der Linux-Kernel: Wer nicht in der Gruppe ist (und nicht root), kann SGID nicht setzen
    if (state.user !== "root" && !state.groups.includes(node.group)) mode &= ~0o2000;
    node.mode = mode;

    if (recursive && node.type === "directory") {
        for (const child of Object.values(node.children ?? {})) {
            changeMode(state, child, `${operand}/${child.name}`, modeText, true, lines);
        }
    }
}

export const chmodCommand: Command = (args, state) => {
    let recursive = false;
    let modeText: string | undefined;
    const operands: string[] = [];

    for (const arg of args) {
        if (arg === "-R" || arg === "--recursive") {
            recursive = true;
        } else if (modeText === undefined) {
            modeText = arg;
        } else {
            operands.push(arg);
        }
    }

    if (modeText === undefined) return usageError("chmod", "missing operand");
    if (operands.length === 0) return usageError("chmod", `missing operand after ‘${modeText}’`);

    const lines: string[] = [];
    for (const operand of operands) {
        const result = state.fs.lookup(resolvePath(state.cwd, operand), state.user, state.groups);
        if (!result.ok) {
            lines.push(`chmod: cannot access '${operand}': ${errorMessage(result.error)}`);
            continue;
        }
        if (applyMode(result.node, modeText, state.umask) === null) {
            return usageError("chmod", `invalid mode: ‘${modeText}’`);
        }
        changeMode(state, result.node, operand, modeText, recursive, lines);
    }
    return { lines };
};
