import { useState, type FormEvent } from "react";
import TaskFormattedText from "./TaskFormattedText.tsx";

type TaskAnswerInputProps = {
    choices?: string[];
    disabled: boolean;
    wrong: boolean;
    onAnswer: (answer: string) => void;
};

export default function TaskAnswerInput({ choices, disabled, wrong, onAnswer }: Readonly<TaskAnswerInputProps>) {
    const [answer, setAnswer] = useState("");

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (answer.trim()) onAnswer(answer);
    };

    if (choices) {
        return (
            <div className="task-choices">
                {choices.map((choice) => (
                    <button
                        key={choice}
                        type="button"
                        className="button task-choice"
                        disabled={disabled}
                        onClick={() => onAnswer(choice)}
                    >
                        <TaskFormattedText text={choice} />
                    </button>
                ))}
                {wrong && <p className="task-wrong">Leider falsch – versuch es noch einmal.</p>}
            </div>
        );
    }

    return (
        <form className="task-answer" onSubmit={handleSubmit}>
            <label htmlFor="task-answer-input">Deine Antwort</label>
            <div className="task-answer-row">
                <input
                    id="task-answer-input"
                    type="text"
                    value={answer}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={disabled}
                    onChange={(event) => setAnswer(event.target.value)}
                />
                <button type="submit" className="button button-primary" disabled={disabled || !answer.trim()}>
                    Prüfen
                </button>
            </div>
            {wrong && <p className="task-wrong">Leider falsch – versuch es noch einmal.</p>}
        </form>
    );
}
