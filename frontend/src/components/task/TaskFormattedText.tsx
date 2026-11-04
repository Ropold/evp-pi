type TaskFormattedTextProps = {
    text: string;
};

/** Zeigt `code` und **fett** aus den Aufgabentexten formatiert an */
export default function TaskFormattedText({ text }: Readonly<TaskFormattedTextProps>) {
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
