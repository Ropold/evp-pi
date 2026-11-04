import type { ReactNode } from "react";
import TaskFormattedText from "./TaskFormattedText.tsx";

type TaskSuccessProps = {
    correct: boolean;
    explanation: string;
    children: ReactNode;
};

export default function TaskSuccess({ correct, explanation, children }: Readonly<TaskSuccessProps>) {
    return (
        <div className={`task-box ${correct ? "task-success" : "task-failure"}`} role="status">
            <strong>{correct ? "✓ Richtig!" : "✗ Leider falsch"}</strong>
            <p>
                <TaskFormattedText text={explanation} />
            </p>
            {children}
        </div>
    );
}
