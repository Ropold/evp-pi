import { useState } from "react";
import "../styles/practice/Practice.css";
import type { PracticeSettingsModel } from "../models/ProgressModel.ts";
import type { Rating } from "../models/Rating.ts";
import TaskSession from "../task/TaskSession.tsx";
import { loadProgress, loadSettings, saveProgress, saveSettings } from "../utils/ProgressStorage.ts";
import { applyRating } from "../utils/RepetitionScheduler.ts";
import { countDue, countNew, filterTasks, pickNextTask } from "../utils/TaskFilters.ts";
import PracticeFilter from "./PracticeFilter.tsx";

export default function Practice() {
    const [progress, setProgress] = useState(loadProgress);
    const [settings, setSettings] = useState(loadSettings);
    const [current, setCurrent] = useState(() => pickNextTask(settings, progress));
    const [round, setRound] = useState(0);

    const showNext = (pick: ReturnType<typeof pickNextTask>) => {
        setCurrent(pick);
        setRound((value) => value + 1);
    };

    const handleSettings = (next: PracticeSettingsModel) => {
        setSettings(next);
        saveSettings(next);
        showNext(pickNextTask(next, progress));
    };

    const handleRated = (rating: Rating, helped: boolean) => {
        if (!current.task) return;
        const nextProgress = applyRating(progress, current.task.id, helped ? "schwer" : rating, helped);
        setProgress(nextProgress);
        saveProgress(nextProgress);
        showNext(pickNextTask(settings, nextProgress, current.task.id));
    };

    const handleSkip = () => showNext(pickNextTask(settings, progress, current.task?.id));

    const tasks = filterTasks(settings, progress);
    const position = `Fällig: ${countDue(tasks, progress)} · Neu: ${countNew(tasks, progress)} · Auswahl: ${tasks.length}`;

    return (
        <section className="page practice">
            <h1>Üben</h1>
            <PracticeFilter settings={settings} progress={progress} onChange={handleSettings} />

            {current.ahead && (
                <p className="practice-note">Gerade ist nichts fällig – du wiederholst vorgezogen.</p>
            )}

            {current.task ? (
                <TaskSession
                    key={`${current.task.id}-${round}`}
                    task={current.task}
                    position={position}
                    mode="practice"
                    onRated={handleRated}
                    onSkip={handleSkip}
                />
            ) : (
                <div className="practice-empty">
                    <p>Für diese Auswahl gibt es keine Aufgaben.</p>
                    <button type="button" className="button" onClick={() => handleSettings({ ratingFilter: "alle", category: "alle" })}>
                        Filter zurücksetzen
                    </button>
                </div>
            )}
        </section>
    );
}
