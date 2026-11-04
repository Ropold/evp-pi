import type { Command, CommandResultModel } from "../../models/CommandResultModel.ts";
import type { ShellStateModel } from "../../models/ShellStateModel.ts";
import { tokenize } from "../CommandParser.ts";
import { resolvePath } from "../filesystem/PathResolver.ts";
import { errorMessage } from "../filesystem/VirtualFileSystem.ts";
import { adduserCommand } from "./AdduserCommand.ts";
import { catCommand } from "./CatCommand.ts";
import { cdCommand } from "./CdCommand.ts";
import { chgrpCommand } from "./ChgrpCommand.ts";
import { chmodCommand } from "./ChmodCommand.ts";
import { chownCommand } from "./ChownCommand.ts";
import { clearCommand } from "./ClearCommand.ts";
import { can, createNode, prepareCreate, stripColors } from "./CommandHelpers.ts";
import { cpCommand } from "./CpCommand.ts";
import { echoCommand } from "./EchoCommand.ts";
import { exitCommand } from "./ExitCommand.ts";
import { groupsCommand } from "./GroupsCommand.ts";
import { helpCommand } from "./HelpCommand.ts";
import { helpLines, HELP_TEXTS } from "./HelpTexts.ts";
import { hostnameCommand } from "./HostnameCommand.ts";
import { idCommand } from "./IdCommand.ts";
import { lsCommand } from "./LsCommand.ts";
import { manCommand } from "./ManCommand.ts";
import { mkdirCommand } from "./MkdirCommand.ts";
import { mvCommand } from "./MvCommand.ts";
import { pingCommand } from "./PingCommand.ts";
import { pwdCommand } from "./PwdCommand.ts";
import { rmCommand } from "./RmCommand.ts";
import { rmdirCommand } from "./RmdirCommand.ts";
import { sshCommand } from "./SshCommand.ts";
import { suCommand } from "./SuCommand.ts";
import { sudoCommand } from "./SudoCommand.ts";
import { touchCommand } from "./TouchCommand.ts";
import { umaskCommand } from "./UmaskCommand.ts";
import { usermodCommand } from "./UsermodCommand.ts";
import { whoamiCommand } from "./WhoamiCommand.ts";

const COMMANDS: Record<string, Command> = {
    adduser: adduserCommand,
    cat: catCommand,
    cd: cdCommand,
    chgrp: chgrpCommand,
    chmod: chmodCommand,
    chown: chownCommand,
    clear: clearCommand,
    cp: cpCommand,
    echo: echoCommand,
    exit: exitCommand,
    groups: groupsCommand,
    help: helpCommand,
    hostname: hostnameCommand,
    id: idCommand,
    logout: exitCommand,
    ls: lsCommand,
    man: manCommand,
    mkdir: mkdirCommand,
    mv: mvCommand,
    ping: pingCommand,
    pwd: pwdCommand,
    rm: rmCommand,
    rmdir: rmdirCommand,
    ssh: sshCommand,
    su: suCommand,
    sudo: sudoCommand,
    touch: touchCommand,
    umask: umaskCommand,
    usermod: usermodCommand,
    whoami: whoamiCommand,
};

/** Einfache Aliase wie in einer typischen ~/.bashrc */
const ALIASES: Record<string, string[]> = {
    ll: ["ls", "-la"],
};

export function commandNames(): string[] {
    return [...Object.keys(COMMANDS), ...Object.keys(ALIASES)].sort();
}

/** Einen Befehl mit bereits zerlegten Argumenten ausführen (auch für sudo) */
export function runCommand(
    name: string,
    args: string[],
    state: ShellStateModel,
    caller = "bash",
): CommandResultModel {
    const alias = ALIASES[name];
    if (alias) {
        name = alias[0];
        args = [...alias.slice(1), ...args];
    }

    const command = COMMANDS[name];
    if (!command) {
        return { lines: [caller === "sudo" ? `sudo: ${name}: command not found` : `${name}: command not found`] };
    }
    if (args.includes("--help") && name !== "echo" && HELP_TEXTS[name]) {
        return { lines: helpLines(name) };
    }

    try {
        return command(args, state);
    } catch (error) {
        console.error(error);
        return { lines: [`${name}: interner Fehler der Simulation`] };
    }
}

/** Ausgabe in eine Datei schreiben (> überschreibt, >> hängt an) */
function writeToFile(state: ShellStateModel, operand: string, text: string, append: boolean): string | null {
    const target = prepareCreate(state, resolvePath(state.cwd, operand));
    if (!target.ok) return `bash: ${operand}: ${errorMessage(target.error)}`;

    const existing = target.existing;
    if (!existing) {
        createNode(state, target.parent, target.name, "file", 0o666, text);
        return null;
    }
    if (existing.type === "directory") return `bash: ${operand}: Is a directory`;
    if (!can(state, existing, "w")) return `bash: ${operand}: Permission denied`;

    existing.content = append ? (existing.content ?? "") + text : text;
    existing.modified = Date.now();
    return null;
}

/** Führt eine Eingabezeile aus. Wirft nie einen Fehler, unbekannte Befehle wie Bash. */
export function executeCommandLine(line: string, state: ShellStateModel): CommandResultModel {
    const tokens = tokenize(line, state);
    if (tokens.length === 0) return { lines: [] };

    const redirectIndex = tokens.findIndex((token) => token === ">" || token === ">>");
    if (redirectIndex < 0) return runCommand(tokens[0], tokens.slice(1), state);

    const file = tokens[redirectIndex + 1];
    if (!file) return { lines: ["bash: syntax error near unexpected token `newline'"] };

    const commandTokens = [...tokens.slice(0, redirectIndex), ...tokens.slice(redirectIndex + 2)];
    const result = commandTokens.length > 0 ? runCommand(commandTokens[0], commandTokens.slice(1), state) : { lines: [] };
    const text = result.lines.map(stripColors).map((outputLine) => outputLine + "\n").join("");
    const error = writeToFile(state, file, text, tokens[redirectIndex] === ">>");
    return { lines: error ? [error] : [] };
}
