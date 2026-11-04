import { useState } from "react";
import Terminal from "./Terminal.tsx";
import { createShellState } from "../utils/filesystem/FileSystemFactory.ts";

const WELCOME_LINES = [
    "Willkommen auf pi (simuliertes Ubuntu).",
    "Tippe \x1b[1mhelp\x1b[0m für alle Befehle, \x1b[1mman befehl\x1b[0m für Details. Tab vervollständigt.",
    "",
];

export default function TerminalFreeMode() {
    const [state, setState] = useState(() => createShellState());
    const [round, setRound] = useState(0);

    const reset = () => {
        setState(createShellState());
        setRound((value) => value + 1);
    };

    return (
        <section className="page">
            <h1>Freies Terminal</h1>
            <p>
                Probiere Befehle ohne Aufgabe aus. Du bist als <code>anna</code> eingeloggt (Gruppen team und sudo).
                Andere Benutzer: <code>ssh ben@pi</code>, <code>sudo su - clara</code>.
            </p>
            <div className="task-buttons">
                <button type="button" className="button button-quiet" onClick={reset}>
                    System zurücksetzen
                </button>
            </div>
            <Terminal key={round} state={state} welcomeLines={WELCOME_LINES} />
        </section>
    );
}
