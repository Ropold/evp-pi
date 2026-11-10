import { useState, type FormEvent, type KeyboardEvent } from "react";
import { shuffle } from "../utils/Shuffle.ts";
import TaskFormattedText from "./TaskFormattedText.tsx";

type TaskAnswerInputProps = {
    choices?: string[];
    /** Freie Erklärung: mehrzeiliges Textfeld, danach Vergleich mit der Musterlösung */
    multiline?: boolean;
    disabled: boolean;
    wrong: boolean;
    onAnswer: (answer: string) => void;
};

export default function TaskAnswerInput({ choices, multiline = false, disabled, wrong, onAnswer }: Readonly<TaskAnswerInputProps>) {
    const [answer, setAnswer] = useState("");
    // Antwortmöglichkeiten einmal pro Aufgabe mischen, damit man sich nicht die Position merkt
    const [shuffledChoices] = useState(() => (choices ? shuffle(choices) : undefined));

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (answer.trim()) onAnswer(answer);
    };

    // Enter schickt ab, Shift+Enter macht eine neue Zeile
    const handleTextareaKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (answer.trim()) onAnswer(answer);
        }
    };

    if (shuffledChoices) {
        return (
            <div className="task-choices">
                {shuffledChoices.map((choice) => (
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

    if (multiline) {
        return (
            <form className="task-answer" onSubmit={handleSubmit}>
                <label htmlFor="task-answer-input">Deine Antwort (in eigenen Worten) – Enter vergleicht, Shift+Enter = neue Zeile</label>
                <textarea
                    id="task-answer-input"
                    className="task-answer-text"
                    rows={4}
                    value={answer}
                    spellCheck={false}
                    disabled={disabled}
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={handleTextareaKey}
                />
                <div className="task-buttons">
                    <button type="submit" className="button button-primary" disabled={disabled || !answer.trim()}>
                        Mit Musterlösung vergleichen
                    </button>
                </div>
            </form>
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
