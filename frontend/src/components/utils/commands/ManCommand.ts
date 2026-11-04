import type { Command } from "../../models/CommandResultModel.ts";
import { HELP_TEXTS, manLines } from "./HelpTexts.ts";

export const manCommand: Command = (args) => {
    if (args.length === 0) return { lines: ["What manual page do you want?", "For example, try 'man man'."] };

    const lines: string[] = [];
    for (const name of args) {
        if (lines.length > 0) lines.push("");
        lines.push(...(HELP_TEXTS[name] ? manLines(name) : [`No manual entry for ${name}`]));
    }
    return { lines };
};
