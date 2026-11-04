import { useCallback, useState } from "react";
import type { Rating } from "../models/Rating.ts";
import type { ShellStateModel } from "../models/ShellStateModel.ts";
import type { TaskModel } from "../models/TaskModel.ts";
import Terminal from "../terminal/Terminal.tsx";
import { createTaskState, isAnswerCorrect, isTerminalTaskSolved } from "../utils/TaskChecker.ts";
import TaskPanel, { type TaskStatus } from "./TaskPanel.tsx";

type TaskSessionProps = {
    task: TaskModel;
    position: string;
    mode: "practice" | "exam";
    /** Übungsmodus: Aufgabe gelöst und bewertet */
    onRated?: (rating: Rating, helped: boolean) => void;
    /** Prüfungsmodus: Aufgabe abgeschlossen (richtig oder falsch) */
    onFinished?: (correct: boolean) => void;
    onSkip: () => void;
};

/** Eine Aufgabe: Aufgaben-Leiste oben, Terminal mit eigener Ausgangslage darunter */
export default function TaskSession({ task, position, mode, onRated, onFinished, onSkip }: Readonly<TaskSessionProps>) {
    const [shell, setShell] = useState(() => createTaskState(task));
    const [attempt, setAttempt] = useState(0);
    const [status, setStatus] = useState<TaskStatus>("open");
    const [hintLevel, setHintLevel] = useState(0);
    const [solutionShown, setSolutionShown] = useState(false);
    const [answerWrong, setAnswerWrong] = useState(false);

    const handleCommand = useCallback(
        (line: string, state: ShellStateModel) => {
            if (isTerminalTaskSolved(task, state, line)) {
                setStatus((previous) => (previous === "open" ? "solved" : previous));
            }
        },
        [task],
    );

    const handleAnswer = (answer: string) => {
        if (isAnswerCorrect(task, answer)) {
            setStatus("solved");
        } else if (mode === "exam") {
            setStatus("failed");
        } else {
            setAnswerWrong(true);
        }
    };

    const handleRestart = () => {
        setShell(createTaskState(task));
        setAttempt((value) => value + 1);
        setAnswerWrong(false);
    };

    return (
        <div className="task-session">
            <TaskPanel
                task={task}
                position={position}
                mode={mode}
                status={status}
                hintLevel={hintLevel}
                solutionShown={solutionShown}
                answerWrong={answerWrong}
                onHint={() => setHintLevel((level) => Math.min(level + 1, task.hints.length))}
                onShowSolution={() => setSolutionShown(true)}
                onRestart={handleRestart}
                onSkip={onSkip}
                onAnswer={handleAnswer}
                onRate={(rating) => onRated?.(rating, hintLevel > 0 || solutionShown)}
                onNext={() => onFinished?.(status === "solved")}
            />
            <Terminal key={attempt} state={shell} onCommandExecuted={handleCommand} />
        </div>
    );
}
