import { useState } from "react";
import "../styles/practice/Practice.css";
import { CATEGORY_LABELS, TASK_CATEGORIES, type TaskCategory } from "../models/TaskCategory.ts";
import type { TaskModel } from "../models/TaskModel.ts";
import TaskSession from "../task/TaskSession.tsx";
import { loadProgress, saveProgress } from "../utils/ProgressStorage.ts";
import { applyRating } from "../utils/RepetitionScheduler.ts";
import { shuffle } from "../utils/Shuffle.ts";
import { ALL_TASKS } from "../utils/TaskFilters.ts";
import ExamResult, { type ExamAnswer } from "./ExamResult.tsx";

const COUNTS = [10, 20, 0];

export default function Exam() {
    const [category, setCategory] = useState<TaskCategory | "alle">("alle");
    const [count, setCount] = useState(10);
    const [tasks, setTasks] = useState<TaskModel[] | null>(null);
    const [answers, setAnswers] = useState<ExamAnswer[]>([]);

    const available = ALL_TASKS.filter((task) => category === "alle" || task.category === category);

    const start = () => {
        const selection = shuffle(available);
        setTasks(count === 0 ? selection : selection.slice(0, count));
        setAnswers([]);
    };

    const finishTask = (task: TaskModel, correct: boolean) => {
        const nextAnswers = [...answers, { task, correct }];
        setAnswers(nextAnswers);

        // Am Ende: falsche Aufgaben im Übungsmodus als "schwer" einplanen
        if (tasks && nextAnswers.length === tasks.length) {
            let progress = loadProgress();
            for (const answer of nextAnswers) {
                if (!answer.correct) progress = applyRating(progress, answer.task.id, "schwer", false);
            }
            saveProgress(progress);
        }
    };

    if (tasks && answers.length === tasks.length) {
        return (
            <section className="page practice">
                <h1>Prüfung – Auswertung</h1>
                <ExamResult answers={answers} onRestart={() => setTasks(null)} />
            </section>
        );
    }

    if (tasks) {
        const task = tasks[answers.length];
        return (
            <section className="page practice">
                <h1>Prüfung</h1>
                <TaskSession
                    key={`${task.id}-${answers.length}`}
                    task={task}
                    position={`Aufgabe ${answers.length + 1} von ${tasks.length}`}
                    mode="exam"
                    onFinished={(correct) => finishTask(task, correct)}
                    onSkip={() => finishTask(task, false)}
                />
            </section>
        );
    }

    return (
        <section className="page practice">
            <h1>Prüfung</h1>
            <div className="exam-setup">
                <p>
                    Ohne Tipps und Lösungen. Bei Fragen zählt der erste Versuch, Terminal-Aufgaben kannst du
                    überspringen. Falsche Aufgaben kommen danach im Übungsmodus als „Schwer“ wieder.
                </p>

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

                <div className="filter-chips" role="group" aria-label="Anzahl Aufgaben">
                    {COUNTS.map((value) => (
                        <button
                            key={value}
                            type="button"
                            className={`chip ${count === value ? "chip-active" : ""}`}
                            aria-pressed={count === value}
                            onClick={() => setCount(value)}
                        >
                            {value === 0 ? `Alle (${available.length})` : `${Math.min(value, available.length)} Aufgaben`}
                        </button>
                    ))}
                </div>

                <button type="button" className="button button-primary" onClick={start} disabled={available.length === 0}>
                    Prüfung starten
                </button>
            </div>
        </section>
    );
}
