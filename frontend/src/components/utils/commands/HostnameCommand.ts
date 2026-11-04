import type { Command } from "../../models/CommandResultModel.ts";

export const hostnameCommand: Command = (_args, state) => ({ lines: [state.hostname] });
