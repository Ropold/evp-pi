import { useEffect } from "react";
import "../styles/task/TaskPanel.css";
import { CATEGORY_LABELS } from "../models/TaskCategory.ts";
import type { Rating } from "../models/Rating.ts";
import type { TaskModel } from "../models/TaskModel.ts";
import TaskAnswerInput from "./TaskAnswerInput.tsx";
import TaskButtons from "./TaskButtons.tsx";
import TaskFormattedText from "./TaskFormattedText.tsx";
import TaskHint from "./TaskHint.tsx";
import TaskRating from "./TaskRating.tsx";
import TaskSolution from "./TaskSolution.tsx";
import TaskSuccess from "./TaskSuccess.tsx";

/** review = freie Antwort abgegeben, Musterlösung wird zum Selbstvergleich gezeigt */
export type TaskStatus = "open" | "review" | "solved" | "failed";

type TaskPanelProps = {
    task: TaskModel;
    /** z. B. "Fällig: 3 · Neu: 12" oder "Aufgabe 4 von 10" */
    position: string;
    mode: "practice" | "exam";
    status: TaskStatus;
    hintLevel: number;
    solutionShown: boolean;
    answerWrong: boolean;
    onHint: () => void;
    onShowSolution: () => void;
    onRestart: () => void;
    onSkip: () => void;
    onAnswer: (answer: string) => void;
    /** Übungsmodus: Bewertung abgeben */
    onRate: (rating: Rating) => void;
    /** Prüfungsmodus: weiter zur nächsten Aufgabe */
    onNext: () => void;
    /** Tipp- und Lösungs-Buttons auch im Prüfungsmodus (Probeklausuren) */
    allowHelp?: boolean;
    /** Freie Antwort, die mit der Musterlösung verglichen wird */
    ownAnswer?: string;
    onSelfAssess?: (correct: boolean) => void;
};

export default function TaskPanel(props: Readonly<TaskPanelProps>) {
    const { task, position, mode, status, hintLevel, solutionShown, answerWrong } = props;
    const isPractice = mode === "practice";
    const showHelp = isPractice || props.allowHelp === true;
    const helpUsed = hintLevel > 0 || solutionShown;
    const { onSelfAssess } = props;

    // Selbstvergleich: Enter = „Hatte ich richtig“ (außer in Eingabefeldern/Terminal oder auf einem anderen Button)
    useEffect(() => {
        if (status !== "review") return;
        const handleKey = (event: KeyboardEvent) => {
            if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;
            const target = event.target as HTMLElement | null;
            if (target?.closest("input, textarea, button, select, .terminal, .xterm")) return;
            event.preventDefault();
            onSelfAssess?.(true);
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [status, onSelfAssess]);

    return (
        <section className="task-panel" aria-live="polite">
            <header className="task-header">
                <span className="task-category">{CATEGORY_LABELS[task.category]}</span>
                <span className="task-position">{position}</span>
            </header>

            <div className="task-text">
                <TaskFormattedText text={task.text} />
            </div>
            <p className="task-muted">
                {task.type === "terminal"
                    ? "Löse die Aufgabe im Terminal unten. Geprüft wird nach jedem Befehl."
                    : "Antworte oben. Im Terminal unten kannst du nachsehen und ausprobieren."}
            </p>

            {status === "open" && task.type === "question" && (
                <TaskAnswerInput
                    key={task.id}
                    choices={task.choices}
                    multiline={task.check.type === "self"}
                    disabled={false}
                    wrong={answerWrong && isPractice}
                    onAnswer={props.onAnswer}
                />
            )}

            {status === "open" && (
                <TaskButtons
                    showHelp={showHelp}
                    hintLevel={hintLevel}
                    hintCount={task.hints.length}
                    solutionShown={solutionShown}
                    onHint={props.onHint}
                    onShowSolution={props.onShowSolution}
                    onRestart={props.onRestart}
                    onSkip={props.onSkip}
                />
            )}

            {status === "open" && showHelp && <TaskHint hints={task.hints} level={hintLevel} />}
            {status === "open" && showHelp && solutionShown && <TaskSolution task={task} />}

            {status === "review" && (
                <div className="task-box task-review">
                    <strong>Deine Antwort</strong>
                    <p className="task-own-answer">{props.ownAnswer}</p>
                    <strong>Musterlösung</strong>
                    <p>
                        <TaskFormattedText text={task.solutions[0]} />
                    </p>
                    <p className="task-muted">Vergleiche ehrlich: Stimmt deine Antwort inhaltlich mit der Musterlösung überein? (Enter = „Hatte ich richtig“)</p>
                    <div className="task-buttons">
                        <button type="button" className="button rating-leicht" onClick={() => props.onSelfAssess?.(true)} autoFocus>
                            Hatte ich richtig
                        </button>
                        <button type="button" className="button rating-schwer" onClick={() => props.onSelfAssess?.(false)}>
                            Hatte ich falsch
                        </button>
                    </div>
                </div>
            )}

            {(status === "solved" || status === "failed") && (
                <TaskSuccess correct={status === "solved"} explanation={task.explanation}>
                    {status === "failed" && <TaskSolution task={task} />}
                    {isPractice ? (
                        <TaskRating helpUsed={helpUsed} onRate={props.onRate} />
                    ) : (
                        <button type="button" className="button button-primary" onClick={props.onNext} autoFocus>
                            Weiter
                        </button>
                    )}
                </TaskSuccess>
            )}
        </section>
    );
}
