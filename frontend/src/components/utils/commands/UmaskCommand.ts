import type { Command } from "../../models/CommandResultModel.ts";

function symbolic(umask: number): string {
    const allowed = ~umask & 0o777;
    const part = (shift: number) => {
        const bits = (allowed >> shift) & 0o7;
        return (bits & 4 ? "r" : "") + (bits & 2 ? "w" : "") + (bits & 1 ? "x" : "");
    };
    return `u=${part(6)},g=${part(3)},o=${part(0)}`;
}

export const umaskCommand: Command = (args, state) => {
    if (args.length === 0) return { lines: [state.umask.toString(8).padStart(4, "0")] };
    if (args[0] === "-S") return { lines: [symbolic(state.umask)] };

    if (!/^[0-7]{1,4}$/.test(args[0])) {
        return { lines: [`bash: umask: ${args[0]}: octal number out of range`] };
    }
    state.umask = parseInt(args[0], 8) & 0o777;
    return { lines: [] };
};
