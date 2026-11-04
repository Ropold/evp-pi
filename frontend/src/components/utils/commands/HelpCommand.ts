import type { Command } from "../../models/CommandResultModel.ts";
import { HELP_TEXTS } from "./HelpTexts.ts";

export const helpCommand: Command = () => {
    const names = Object.keys(HELP_TEXTS).sort();
    const width = Math.max(...names.map((name) => name.length)) + 2;
    return {
        lines: [
            "Befehle der Simulation (Details: man BEFEHL oder BEFEHL --help):",
            "",
            ...names.map((name) => `  ${name.padEnd(width)}${HELP_TEXTS[name].summary}`),
        ],
    };
};
