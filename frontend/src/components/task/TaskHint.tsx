import TaskFormattedText from "./TaskFormattedText.tsx";

type TaskHintProps = {
    hints: string[];
    level: number;
};

export default function TaskHint({ hints, level }: Readonly<TaskHintProps>) {
    if (level === 0) return null;

    return (
        <div className="task-box task-hint">
            <strong>Tipp</strong>
            <ul>
                {hints.slice(0, level).map((hint) => (
                    <li key={hint}>
                        <TaskFormattedText text={hint} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
