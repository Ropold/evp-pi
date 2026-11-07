import { useState } from "react";
import "../styles/practice/Practice.css";
import "../styles/practice/Content.css";
import { CATEGORY_LABELS, TASK_CATEGORIES, type TaskCategory } from "../models/TaskCategory.ts";
import type { TaskModel } from "../models/TaskModel.ts";
import TaskFormattedText from "../task/TaskFormattedText.tsx";
import { ALL_TASKS } from "../utils/TaskFilters.ts";

/** Lernstoff: alle Aufgaben mit Lösung und Erklärung zum Durchlesen */
export default function Content() {
    const [category, setCategory] = useState<TaskCategory | "alle">("alle");
    const [search, setSearch] = useState("");

    const query = search.trim().toLowerCase();
    const matches = (task: TaskModel) =>
        query === "" ||
        [task.text, task.explanation, ...task.solutions].some((value) => value.toLowerCase().includes(query));

    const categories = category === "alle" ? TASK_CATEGORIES : [category];
    const sections = categories
        .map((value) => ({ category: value, tasks: ALL_TASKS.filter((task) => task.category === value && matches(task)) }))
        .filter((section) => section.tasks.length > 0);

    return (
        <section className="page practice content">
            <h1>Inhalt</h1>
            <p className="task-muted">
                Alle Aufgaben mit Lösung und kurzer Erklärung – zum Durchlesen, bevor du übst.
            </p>

            <div className="practice-filter">
                <label className="filter-category">
                    <span>Bereich</span>
                    <select value={category} onChange={(event) => setCategory(event.target.value as TaskCategory | "alle")}>
                        <option value="alle">Alle Bereiche</option>
                        {TASK_CATEGORIES.map((value) => (
                            <option key={value} value={value}>
                                {CATEGORY_LABELS[value]}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="filter-category">
                    <span>Suche</span>
                    <input
                        type="search"
                        className="content-search"
                        value={search}
                        placeholder="z. B. chmod"
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </label>
            </div>

            {sections.length === 0 && <p className="practice-empty">Nichts gefunden.</p>}

            {sections.map((section) => (
                <div key={section.category} className="content-section">
                    <h2>{CATEGORY_LABELS[section.category]}</h2>
                    <ol className="content-list">
                        {section.tasks.map((task) => (
                            <li key={task.id} className="content-item">
                                <p className="content-question">
                                    <span className="badge badge-new">{task.type === "terminal" ? "Terminal" : "Frage"}</span>{" "}
                                    <TaskFormattedText text={task.text} />
                                </p>
                                <div className="content-answer">
                                    <strong>
                                        {task.type === "question"
                                            ? "Antwort:"
                                            : task.solutionIsSequence
                                              ? "Lösung (nacheinander):"
                                              : task.solutions.length > 1
                                                ? "Lösungen (eine davon):"
                                                : "Lösung:"}
                                    </strong>{" "}
                                    {task.type === "terminal" ? (
                                        task.solutions.map((solution, index) => (
                                            <span key={solution}>
                                                {index > 0 && (task.solutionIsSequence ? " → " : " oder ")}
                                                <code>{solution}</code>
                                            </span>
                                        ))
                                    ) : (
                                        <TaskFormattedText text={task.solutions[0]} />
                                    )}
                                </div>
                                <p className="content-explanation">
                                    <TaskFormattedText text={task.explanation} />
                                </p>
                            </li>
                        ))}
                    </ol>
                </div>
            ))}
        </section>
    );
}
