import type { Command } from "../../models/CommandResultModel.ts";

export const whoamiCommand: Command = (_args, state) => ({ lines: [state.user] });
