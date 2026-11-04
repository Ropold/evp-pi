import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import "../styles/terminal/Terminal.css";
import type { ShellStateModel } from "../models/ShellStateModel.ts";
import { executeCommandLine } from "../utils/commands/CommandRegistry.ts";
import { displayPath } from "../utils/filesystem/PathResolver.ts";
import { completeLine } from "../utils/TabCompletion.ts";

type TerminalProps = {
    state: ShellStateModel;
    welcomeLines?: string[];
    /** Wird nach jedem ausgeführten Befehl aufgerufen (z. B. für die Aufgabenprüfung) */
    onCommandExecuted?: (line: string, state: ShellStateModel) => void;
};

const CLEAR_SCREEN = "\x1b[2J\x1b[3J\x1b[H";

function buildPrompt(state: ShellStateModel): string {
    const symbol = state.user === "root" ? "#" : "$";
    const path = displayPath(state.cwd, state.home);
    return `\x1b[1;32m${state.user}@${state.hostname}\x1b[0m:\x1b[1;34m${path}\x1b[0m${symbol} `;
}

export default function Terminal({ state, welcomeLines = [], onCommandExecuted }: Readonly<TerminalProps>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef(state);
    const onCommandRef = useRef(onCommandExecuted);

    useEffect(() => {
        stateRef.current = state;
        onCommandRef.current = onCommandExecuted;
    }, [state, onCommandExecuted]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const term = new XTerm({
            cursorBlink: true,
            fontFamily: "'Ubuntu Mono', Consolas, 'Courier New', monospace",
            fontSize: 16,
            theme: { background: "#1e1e2e", foreground: "#e4e4ef", cursor: "#e4e4ef" },
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(container);
        fitAddon.fit();

        const history: string[] = [];
        let historyIndex = 0;
        let line = "";
        let cursor = 0;

        const writePrompt = () => term.write(buildPrompt(stateRef.current));

        const redrawLine = () => {
            term.write("\r\x1b[K" + buildPrompt(stateRef.current) + line);
            const stepsBack = line.length - cursor;
            if (stepsBack > 0) term.write(`\x1b[${stepsBack}D`);
        };

        const runLine = () => {
            term.write("\r\n");
            const input = line;
            line = "";
            cursor = 0;

            if (input.trim().length > 0) {
                history.push(input);
                const result = executeCommandLine(input, stateRef.current);
                if (result.clear) term.write(CLEAR_SCREEN);
                for (const outputLine of result.lines) term.write(outputLine + "\r\n");
                onCommandRef.current?.(input, stateRef.current);
            }
            historyIndex = history.length;
            writePrompt();
        };

        const showHistory = (index: number) => {
            historyIndex = index;
            line = history[index] ?? "";
            cursor = line.length;
            redrawLine();
        };

        const handleSequence = (sequence: string) => {
            switch (sequence) {
                case "\x1b[A": // Pfeil hoch
                    if (historyIndex > 0) showHistory(historyIndex - 1);
                    break;
                case "\x1b[B": // Pfeil runter
                    if (historyIndex < history.length) showHistory(historyIndex + 1);
                    break;
                case "\x1b[C": // Pfeil rechts
                    if (cursor < line.length) {
                        cursor++;
                        term.write(sequence);
                    }
                    break;
                case "\x1b[D": // Pfeil links
                    if (cursor > 0) {
                        cursor--;
                        term.write(sequence);
                    }
                    break;
                case "\x1b[H": // Pos1
                    cursor = 0;
                    redrawLine();
                    break;
                case "\x1b[F": // Ende
                    cursor = line.length;
                    redrawLine();
                    break;
                case "\x1b[3~": // Entf
                    if (cursor < line.length) {
                        line = line.slice(0, cursor) + line.slice(cursor + 1);
                        redrawLine();
                    }
                    break;
            }
        };

        const handleChar = (char: string) => {
            switch (char) {
                case "\r":
                    runLine();
                    break;
                case "\n":
                    break;
                case "\x7f": // Backspace
                    if (cursor > 0) {
                        line = line.slice(0, cursor - 1) + line.slice(cursor);
                        cursor--;
                        redrawLine();
                    }
                    break;
                case "\x03": // Strg+C
                    term.write("^C\r\n");
                    line = "";
                    cursor = 0;
                    historyIndex = history.length;
                    writePrompt();
                    break;
                case "\x0c": // Strg+L
                    term.write(CLEAR_SCREEN);
                    redrawLine();
                    break;
                case "\t": {
                    const rest = line.slice(cursor);
                    const completion = completeLine(line.slice(0, cursor), stateRef.current);
                    if (completion.matches.length > 0) {
                        term.write("\r\n" + completion.matches.join("  ") + "\r\n");
                    }
                    line = completion.line + rest;
                    cursor = completion.line.length;
                    redrawLine();
                    break;
                }
                default:
                    if (char >= " ") {
                        line = line.slice(0, cursor) + char + line.slice(cursor);
                        cursor++;
                        if (cursor === line.length) {
                            term.write(char);
                        } else {
                            redrawLine();
                        }
                    }
            }
        };

        const dataListener = term.onData((data) => {
            if (data.startsWith("\x1b")) {
                handleSequence(data);
            } else {
                for (const char of data) handleChar(char);
            }
        });

        for (const welcomeLine of welcomeLines) term.write(welcomeLine + "\r\n");
        writePrompt();
        term.focus();

        const resizeObserver = new ResizeObserver(() => fitAddon.fit());
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
            dataListener.dispose();
            term.dispose();
        };
        // Das Terminal wird nur einmal pro Sitzung erzeugt
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div className="terminal" ref={containerRef} />;
}
