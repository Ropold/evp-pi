import type { Command } from "../../models/CommandResultModel.ts";
import { openSession } from "../SessionManager.ts";

/**
 * su braucht das Passwort des Zielbenutzers. Die Simulation hat keine Passwörter,
 * daher klappt su nur als root (z. B. über sudo su - clara).
 */
export const suCommand: Command = (args, state) => {
    const loginShell = args.includes("-") || args.includes("-l") || args.includes("--login");
    const user = args.find((arg) => !arg.startsWith("-")) ?? "root";

    if (!state.fs.findUser(user)) return { lines: [`su: user ${user} does not exist or the user entry does not contain all the required fields`] };

    if (state.user !== "root") {
        return {
            lines: [
                "Password: ",
                "su: Authentication failure",
                "(Simulation: keine Passwörter – nutze sudo su - " + user + " oder ssh " + user + "@" + state.fs.hostname + ")",
            ],
        };
    }

    openSession(state, user, "su", !loginShell);
    return { lines: [] };
};
