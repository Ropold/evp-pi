type TaskButtonsProps = {
    showHelp: boolean;
    hintLevel: number;
    hintCount: number;
    solutionShown: boolean;
    onHint: () => void;
    onShowSolution: () => void;
    onRestart: () => void;
    onSkip: () => void;
};

export default function TaskButtons({
    showHelp,
    hintLevel,
    hintCount,
    solutionShown,
    onHint,
    onShowSolution,
    onRestart,
    onSkip,
}: Readonly<TaskButtonsProps>) {
    return (
        <div className="task-buttons">
            {showHelp && (
                <>
                    <button type="button" className="button" onClick={onHint} disabled={hintLevel >= hintCount}>
                        Tipp {hintCount > 0 && `(${Math.min(hintLevel, hintCount)}/${hintCount})`}
                    </button>
                    <button type="button" className="button" onClick={onShowSolution} disabled={solutionShown}>
                        Lösung zeigen
                    </button>
                </>
            )}
            <button type="button" className="button button-quiet" onClick={onRestart} title="Ausgangslage wiederherstellen">
                Neu starten
            </button>
            <button type="button" className="button button-quiet" onClick={onSkip}>
                Überspringen
            </button>
        </div>
    );
}
