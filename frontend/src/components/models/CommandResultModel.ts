import type { ShellStateModel } from "./ShellStateModel.ts";

export type CommandResultModel = {
    lines: string[];
    /** Terminal leeren (z. B. bei `clear`) */
    clear?: boolean;
};

export type Command = (args: string[], state: ShellStateModel) => CommandResultModel;
