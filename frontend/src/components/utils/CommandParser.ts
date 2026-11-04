import type { ShellStateModel } from "../models/ShellStateModel.ts";

export type ParsedArgs = {
    /** Kurze Optionen, "-la" wird zu {"l", "a"} */
    flags: Set<string>;
    /** Lange Optionen ohne "--", z. B. "help" */
    longFlags: Set<string>;
    operands: string[];
};

/**
 * Zerlegt eine Zeile wie Bash in Wörter.
 * Beachtet '...' und "..." sowie \ und ersetzt ein ungequotetes ~ am Wortanfang durch das Home.
 */
export function tokenize(line: string, state: ShellStateModel): string[] {
    const tokens: string[] = [];
    let current = "";
    let inToken = false;
    let quote: "'" | '"' | null = null;
    let tildeAllowed = true;

    const finishToken = () => {
        if (inToken) tokens.push(current);
        current = "";
        inToken = false;
        tildeAllowed = true;
    };

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (quote) {
            if (char === quote) {
                quote = null;
            } else if (char === "\\" && quote === '"' && i + 1 < line.length) {
                current += line[++i];
            } else {
                current += char;
            }
            continue;
        }

        if (char === " " || char === "\t") {
            finishToken();
            continue;
        }

        if (char === "'" || char === '"') {
            quote = char;
            inToken = true;
            tildeAllowed = false;
            continue;
        }

        if (char === "\\" && i + 1 < line.length) {
            current += line[++i];
            inToken = true;
            tildeAllowed = false;
            continue;
        }

        if (char === "~" && tildeAllowed && !inToken) {
            const rest = line.slice(i + 1);
            const userName = /^[a-z_][a-z0-9_-]*/i.exec(rest)?.[0] ?? "";
            const next = rest[userName.length];
            const atWordEnd = next === undefined || next === "/" || next === " " || next === "\t";
            const home = userName ? state.fs.findUser(userName)?.home : state.home;

            if (atWordEnd && home) {
                current += home;
                i += userName.length;
                inToken = true;
                tildeAllowed = false;
                continue;
            }
        }

        current += char;
        inToken = true;
        tildeAllowed = false;
    }

    finishToken();
    return tokens;
}

/** Trennt Optionen von Operanden. Nach "--" zählt alles als Operand. */
export function splitFlags(args: string[]): ParsedArgs {
    const flags = new Set<string>();
    const longFlags = new Set<string>();
    const operands: string[] = [];
    let onlyOperands = false;

    for (const arg of args) {
        if (onlyOperands || arg === "-" || !arg.startsWith("-")) {
            operands.push(arg);
        } else if (arg === "--") {
            onlyOperands = true;
        } else if (arg.startsWith("--")) {
            longFlags.add(arg.slice(2));
        } else {
            for (const flag of arg.slice(1)) flags.add(flag);
        }
    }
    return { flags, longFlags, operands };
}

/** Erste nicht erlaubte kurze Option oder undefined */
export function findInvalidFlag(flags: Set<string>, allowed: string): string | undefined {
    return [...flags].find((flag) => !allowed.includes(flag));
}
