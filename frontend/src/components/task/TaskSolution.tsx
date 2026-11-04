import type { TaskModel } from "../models/TaskModel.ts";
import TaskFormattedText from "./TaskFormattedText.tsx";

type TaskSolutionProps = {
    task: TaskModel;
};

export default function TaskSolution({ task }: Readonly<TaskSolutionProps>) {
    let intro = "Richtige Antwort:";
    if (task.type === "terminal") {
        intro = task.solutionIsSequence ? "Lösung (nacheinander ausführen):" : "Mögliche Lösungen:";
    }

    return (
        <div className="task-box task-solution">
            <strong>{intro}</strong>
            <ul>
                {task.solutions.map((solution) => (
                    <li key={solution}>
                        {task.type === "terminal" ? <code>{solution}</code> : <TaskFormattedText text={solution} />}
                    </li>
                ))}
            </ul>
            <p className="task-muted">
                {task.type === "terminal"
                    ? "Tippe die Lösung jetzt selbst im Terminal ein – so merkst du sie dir."
                    : "Gib die Antwort jetzt selbst ein bzw. wähle sie aus."}
            </p>
        </div>
    );
}
