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

export type TaskStatus = "open" | "solved" | "failed";

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
};

export default function TaskPanel(props: Readonly<TaskPanelProps>) {
    const { task, position, mode, status, hintLevel, solutionShown, answerWrong } = props;
    const isPractice = mode === "practice";
    const helpUsed = hintLevel > 0 || solutionShown;

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
                    disabled={false}
                    wrong={answerWrong && isPractice}
                    onAnswer={props.onAnswer}
                />
            )}

            {status === "open" && (
                <TaskButtons
                    showHelp={isPractice}
                    hintLevel={hintLevel}
                    hintCount={task.hints.length}
                    solutionShown={solutionShown}
                    onHint={props.onHint}
                    onShowSolution={props.onShowSolution}
                    onRestart={props.onRestart}
                    onSkip={props.onSkip}
                />
            )}

            {status === "open" && isPractice && <TaskHint hints={task.hints} level={hintLevel} />}
            {status === "open" && isPractice && solutionShown && <TaskSolution task={task} />}

            {status !== "open" && (
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
