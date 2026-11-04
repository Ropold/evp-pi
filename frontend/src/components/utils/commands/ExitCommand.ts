import type { Command } from "../../models/CommandResultModel.ts";
import { closeSession } from "../SessionManager.ts";

export const exitCommand: Command = (_args, state) => ({ lines: closeSession(state) });
