import { Fragment } from "react";

type TaskFormattedTextProps = {
    text: string;
};

/** `code` und **fett** innerhalb einer Zeile */
function Inline({ text }: Readonly<{ text: string }>) {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter((part) => part.length > 0);
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
                if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
                return <span key={index}>{part}</span>;
            })}
        </>
    );
}

/**
 * Zeigt Aufgabentexte formatiert an:
 * `code`, **fett**, Zeilenumbrüche und Blöcke in ``` (z. B. Terminal-Ausgaben).
 */
export default function TaskFormattedText({ text }: Readonly<TaskFormattedTextProps>) {
    const segments = text.split(/```\n?([\s\S]*?)\n?```/g);

    return (
        <>
            {segments.map((segment, index) => {
                // Ungerade Indizes sind die Inhalte der ```-Blöcke
                if (index % 2 === 1) {
                    return (
                        <pre key={index} className="task-pre">
                            <code>{segment}</code>
                        </pre>
                    );
                }
                const lines = segment.replace(/^\n+|\n+$/g, "").split("\n");
                if (lines.length === 1 && lines[0] === "") return null;
                return (
                    <Fragment key={index}>
                        {lines.map((line, lineIndex) => (
                            <Fragment key={lineIndex}>
                                {lineIndex > 0 && <br />}
                                <Inline text={line} />
                            </Fragment>
                        ))}
                    </Fragment>
                );
            })}
        </>
    );
}
