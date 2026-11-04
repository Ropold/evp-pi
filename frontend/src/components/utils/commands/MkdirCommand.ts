import type { Command } from "../../models/CommandResultModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { findInvalidFlag, splitFlags } from "../CommandParser.ts";
import { resolvePath, splitPath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { createNode, prepareCreate, usageError } from "./CommandHelpers.ts";

/** Legt ein Verzeichnis an (777 minus umask, SGID wird vererbt), gibt bei Fehler die Meldung zurück */
function makeOne(state: ShellStateModel, operand: string, path: string, allowExisting: boolean): string | null {
    const fail = (reason: string) => `mkdir: cannot create directory ‘${operand}’: ${reason}`;
    const target = prepareCreate(state, path);

    if (!target.ok) return fail(errorMessage(target.error));
    if (target.existing) {
        if (allowExisting && target.existing.type === "directory") return null;
        return fail("File exists");
    }

    createNode(state, target.parent, target.name, "directory", 0o777);
    return null;
}

export const mkdirCommand: Command = (args, state) => {
    const { flags, operands } = splitFlags(args);
    const invalid = findInvalidFlag(flags, "p");
    if (invalid) return usageError("mkdir", `invalid option -- '${invalid}'`);
    if (operands.length === 0) return usageError("mkdir", "missing operand");

    const lines: string[] = [];
    for (const operand of operands) {
        const target = resolvePath(state.cwd, operand);

        if (flags.has("p")) {
            // Jeden Teil des Pfads nacheinander anlegen, vorhandene Ordner sind ok
            const parts = splitPath(target);
            for (let i = 1; i <= parts.length; i++) {
                const error = makeOne(state, operand, "/" + parts.slice(0, i).join("/"), true);
                if (error) {
                    lines.push(error);
                    break;
                }
            }
        } else {
            const error = makeOne(state, operand, target, false);
            if (error) lines.push(error);
        }
    }
    return { lines };
};
