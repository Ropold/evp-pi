import type { Command } from "../../models/CommandResultModel.ts";

export const pwdCommand: Command = (_args, state) => ({ lines: [state.cwd] });
