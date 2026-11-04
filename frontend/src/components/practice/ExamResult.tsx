import { CATEGORY_LABELS } from "../models/TaskCategory.ts";
import type { TaskModel } from "../models/TaskModel.ts";
import TaskFormattedText from "../task/TaskFormattedText.tsx";

export type ExamAnswer = {
    task: TaskModel;
    correct: boolean;
};

type ExamResultProps = {
    answers: ExamAnswer[];
    onRestart: () => void;
};

export default function ExamResult({ answers, onRestart }: Readonly<ExamResultProps>) {
    const correct = answers.filter((answer) => answer.correct).length;
    const percent = answers.length > 0 ? Math.round((correct / answers.length) * 100) : 0;

    return (
        <div className="exam-result">
            <p className="exam-score">
                <strong>{correct}</strong> von {answers.length} richtig ({percent} %)
            </p>

            <ol className="exam-list">
                {answers.map(({ task, correct: isCorrect }) => (
                    <li key={task.id} className={isCorrect ? "exam-correct" : "exam-wrong"}>
                        <span className="exam-mark" aria-label={isCorrect ? "richtig" : "falsch"}>
                            {isCorrect ? "✓" : "✗"}
                        </span>
                        <div>
                            <span className="task-category">{CATEGORY_LABELS[task.category]}</span>
                            <p>
                                <TaskFormattedText text={task.text} />
                            </p>
                            {!isCorrect && (
                                <p className="task-muted">
                                    Lösung:{" "}
                                    <TaskFormattedText
                                        text={task.solutions
                                            .map((solution) => (task.type === "terminal" ? `\`${solution}\`` : solution))
                                            .join(task.solutionIsSequence ? " → " : " / ")}
                                    />
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ol>

            <div className="task-buttons">
                <button type="button" className="button button-primary" onClick={onRestart}>
                    Neue Prüfung
                </button>
                <a className="button" href="#/ueben">
                    Zum Üben
                </a>
            </div>
        </div>
    );
}
