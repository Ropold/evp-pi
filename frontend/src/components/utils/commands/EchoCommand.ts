import type { Command } from "../../models/CommandResultModel.ts";

export const echoCommand: Command = (args) => ({ lines: [args.join(" ")] });
