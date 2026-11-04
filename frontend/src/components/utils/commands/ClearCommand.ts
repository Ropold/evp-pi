import type { Command } from "../../models/CommandResultModel.ts";

export const clearCommand: Command = () => ({ lines: [], clear: true });
