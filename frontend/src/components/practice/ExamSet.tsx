import { useState } from "react";
import "../styles/practice/Practice.css";
import type { ExamSetModel } from "../models/ExamSetModel.ts";
import TaskFormattedText from "../task/TaskFormattedText.tsx";
import TaskSession from "../task/TaskSession.tsx";
import ExamResult, { type ExamAnswer } from "./ExamResult.tsx";

type ExamSetProps = {
    set: ExamSetModel;
};

/** Ausgangslage und Hinweise der Übung, aufklappbar */
function Situation({ set, open }: Readonly<{ set: ExamSetModel; open: boolean }>) {
    return (
        <details className="exam-situation" open={open}>
            <summary>Hinweise und Ausgangslage</summary>
            <div className="exam-situation-body">
                <TaskFormattedText text={set.intro} />
            </div>
        </details>
    );
}

/**
 * Probeklausur zu einer Übung: alle Aufgaben in der Reihenfolge des Arbeitsblatts.
 * Fragen werden ohne Terminal beantwortet (wie auf Papier), Befehle im Terminal mit der Ausgangslage.
 */
export default function ExamSet({ set }: Readonly<ExamSetProps>) {
    const [started, setStarted] = useState(false);
    const [answers, setAnswers] = useState<ExamAnswer[]>([]);
    const tasks = set.tasks;

    const restart = () => {
        setAnswers([]);
        setStarted(false);
    };

    const finishTask = (correct: boolean, helped = false) => {
        setAnswers((previous) => [...previous, { task: tasks[previous.length], correct, helped }]);
        window.scrollTo(0, 0);
    };

    if (started && answers.length === tasks.length) {
        return (
            <section className="page practice">
                <h1>{set.label} – Auswertung</h1>
                <ExamResult answers={answers} onRestart={restart} restartLabel="Nochmal von vorn" />
            </section>
        );
    }

    if (started) {
        const task = tasks[answers.length];
        const correct = answers.filter((answer) => answer.correct).length;
        return (
            <section className="page practice">
                <h1>{set.title}</h1>
                <div className="exam-progress" aria-hidden="true">
                    <div style={{ width: `${(answers.length / tasks.length) * 100}%` }} />
                </div>
                <p className="task-muted">
                    Bisher {correct} von {answers.length} richtig
                </p>
                <Situation set={set} open={false} />
                <TaskSession
                    key={`${task.id}-${answers.length}`}
                    task={task}
                    position={`${task.title ?? "Aufgabe"} · ${answers.length + 1} von ${tasks.length}`}
                    mode="exam"
                    allowHelp
                    onFinished={finishTask}
                    onSkip={() => finishTask(false)}
                />
            </section>
        );
    }

    const terminalCount = tasks.filter((task) => task.type === "terminal").length;
    return (
        <section className="page practice">
            <h1>{set.title}</h1>
            <div className="exam-setup">
                <p>
                    {tasks.length} Aufgaben in der Reihenfolge des Arbeitsblatts – {terminalCount} davon löst du im Terminal,
                    die übrigen beantwortest du, kannst aber im Terminal (gleicher Server, passender Zustand) nachsehen und
                    ausprobieren. Bei Fragen zählt der erste Versuch. Tipps und Lösung kannst du jederzeit aufrufen – die
                    Aufgabe wird dann in der Auswertung als „mit Hilfe“ markiert. Terminal-Aufgaben kannst du überspringen
                    (zählt als falsch).
                </p>
                <p className="task-muted">Quelle: {set.source}</p>
                <button type="button" className="button button-primary" onClick={() => setStarted(true)}>
                    Klausur starten
                </button>
            </div>
            <Situation set={set} open />
        </section>
    );
}
