import "./styles/Welcome.css";
import { loadProgress } from "./utils/ProgressStorage.ts";
import { ALL_TASKS, countDue, countNew } from "./utils/TaskFilters.ts";

export default function Welcome() {
    const progress = loadProgress();
    const due = countDue(ALL_TASKS, progress);
    const fresh = countNew(ALL_TASKS, progress);

    return (
        <section className="page welcome">
            <h1>Linux-Rechteverwaltung üben</h1>
            <p className="welcome-lead">
                Ein simuliertes Linux-Terminal mit Aufgaben zur Kannliste. Tippe echte Befehle wie <code>chmod</code>,{" "}
                <code>chown</code> oder <code>ls -l</code>, die App prüft das Ergebnis.
            </p>

            <div className="welcome-stats">
                <div>
                    <strong>{due}</strong>
                    <span>fällig</span>
                </div>
                <div>
                    <strong>{fresh}</strong>
                    <span>neu</span>
                </div>
                <div>
                    <strong>{ALL_TASKS.length}</strong>
                    <span>Aufgaben</span>
                </div>
            </div>

            <div className="welcome-actions">
                <a className="button button-primary" href="#/ueben">
                    Jetzt üben
                </a>
                <a className="button" href="#/pruefung">
                    Prüfung simulieren
                </a>
                <a className="button" href="#/terminal">
                    Freies Terminal
                </a>
            </div>

            <h2>So funktioniert es</h2>
            <ul className="welcome-list">
                <li>Oben steht die Aufgabe, darunter das Terminal. Geprüft wird das Ergebnis, nicht der genaue Befehl.</li>
                <li>Hängst du fest: erst Tipp, dann Lösung. Die Lösung tippst du danach selbst ein.</li>
                <li>Nach jeder Aufgabe bewertest du selbst: schwer, mittel oder leicht. Schweres kommt öfter wieder.</li>
                <li>Unbekannte Befehle antworten wie Bash. <code>help</code> zeigt alle Befehle, <code>man befehl</code> die Hilfe.</li>
                <li>Benutzer: anna (in team und sudo), ben (in team), clara. Wechseln mit <code>ssh ben@pi</code>.</li>
            </ul>
        </section>
    );
}
