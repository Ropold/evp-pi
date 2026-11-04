import { useRef, useState, type ChangeEvent } from "react";
import "../styles/practice/Practice.css";
import { RATINGS, RATING_LABELS } from "../models/Rating.ts";
import { CATEGORY_LABELS, TASK_CATEGORIES } from "../models/TaskCategory.ts";
import TaskFormattedText from "../task/TaskFormattedText.tsx";
import { exportProgress, importProgress, loadProgress, resetProgress, saveProgress } from "../utils/ProgressStorage.ts";
import { formatDue } from "../utils/RepetitionScheduler.ts";
import { ALL_TASKS, countDue, countNew } from "../utils/TaskFilters.ts";

export default function ProgressOverview() {
    const [progress, setProgress] = useState(loadProgress);
    const [message, setMessage] = useState("");
    const fileInput = useRef<HTMLInputElement>(null);

    const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        const imported = await importProgress(file);
        if (!imported) {
            setMessage("Die Datei ist kein gültiger Fortschritt.");
            return;
        }
        saveProgress(imported);
        setProgress(imported);
        setMessage("Fortschritt importiert.");
    };

    const handleReset = () => {
        if (!window.confirm("Gesamten Fortschritt löschen? Das kann nicht rückgängig gemacht werden.")) return;
        resetProgress();
        setProgress({});
        setMessage("Fortschritt gelöscht.");
    };

    return (
        <section className="page practice">
            <h1>Fortschritt</h1>
            <p>
                Gesamt: {ALL_TASKS.length} Aufgaben · fällig: {countDue(ALL_TASKS, progress)} · neu: {countNew(ALL_TASKS, progress)}
            </p>

            <div className="progress-table-wrapper">
                <table className="progress-table">
                    <thead>
                        <tr>
                            <th scope="col">Bereich</th>
                            <th scope="col">Neu</th>
                            {RATINGS.map((rating) => (
                                <th scope="col" key={rating}>
                                    {RATING_LABELS[rating]}
                                </th>
                            ))}
                            <th scope="col">Fällig</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TASK_CATEGORIES.map((category) => {
                            const tasks = ALL_TASKS.filter((task) => task.category === category);
                            return (
                                <tr key={category}>
                                    <th scope="row">{CATEGORY_LABELS[category]}</th>
                                    <td>{countNew(tasks, progress)}</td>
                                    {RATINGS.map((rating) => (
                                        <td key={rating}>{tasks.filter((task) => progress[task.id]?.rating === rating).length}</td>
                                    ))}
                                    <td>{countDue(tasks, progress)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {TASK_CATEGORIES.map((category) => (
                <details key={category} className="progress-details">
                    <summary>{CATEGORY_LABELS[category]}</summary>
                    <ul>
                        {ALL_TASKS.filter((task) => task.category === category).map((task) => {
                            const entry = progress[task.id];
                            return (
                                <li key={task.id}>
                                    <span className={`badge ${entry ? `rating-${entry.rating}` : "badge-new"}`}>
                                        {entry ? RATING_LABELS[entry.rating] : "Neu"}
                                    </span>
                                    <span className="progress-task-text">
                                        <TaskFormattedText text={task.text} />
                                    </span>
                                    <span className="task-muted">{formatDue(entry)}</span>
                                </li>
                            );
                        })}
                    </ul>
                </details>
            ))}

            <h2>Sichern</h2>
            <p className="task-muted">
                Der Fortschritt liegt nur in diesem Browser. Mit Export/Import nimmst du ihn auf ein anderes Gerät mit.
            </p>
            <div className="task-buttons">
                <button type="button" className="button" onClick={() => exportProgress(progress)}>
                    Exportieren
                </button>
                <button type="button" className="button" onClick={() => fileInput.current?.click()}>
                    Importieren
                </button>
                <button type="button" className="button button-danger" onClick={handleReset}>
                    Zurücksetzen
                </button>
                <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={handleImport} />
            </div>
            {message && <p role="status">{message}</p>}
        </section>
    );
}
