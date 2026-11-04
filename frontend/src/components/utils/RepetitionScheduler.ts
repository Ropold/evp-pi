import type { ProgressEntryModel, ProgressModel } from "../models/ProgressModel.ts";
import type { Rating } from "../models/Rating.ts";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/**
 * Karteikasten-Prinzip:
 * - schwer: zurück in Fach 0, kommt in wenigen Minuten wieder
 * - mittel: morgen wieder
 * - leicht: ein Fach höher, Abstand verdoppelt sich (2, 4, 8 … Tage)
 */
export function applyRating(
    progress: ProgressModel,
    taskId: string,
    rating: Rating,
    helped: boolean,
    now = Date.now(),
): ProgressModel {
    const previous = progress[taskId];
    const box = previous?.box ?? 0;

    let nextBox = 0;
    let interval = 5 * MINUTE;
    if (rating === "mittel") {
        nextBox = Math.max(1, box);
        interval = DAY;
    } else if (rating === "leicht") {
        nextBox = box + 1;
        interval = 2 ** nextBox * DAY;
    }

    const entry: ProgressEntryModel = {
        rating,
        box: nextBox,
        due: now + interval,
        lastSeen: now,
        timesSolved: (previous?.timesSolved ?? 0) + 1,
        timesHelped: (previous?.timesHelped ?? 0) + (helped ? 1 : 0),
    };
    return { ...progress, [taskId]: entry };
}

export function isDue(entry: ProgressEntryModel | undefined, now = Date.now()): boolean {
    return entry === undefined || entry.due <= now;
}

export function formatDue(entry: ProgressEntryModel | undefined, now = Date.now()): string {
    if (!entry) return "neu";
    const diff = entry.due - now;
    if (diff <= 0) return "fällig";
    if (diff < 60 * MINUTE) return `in ${Math.ceil(diff / MINUTE)} Min.`;
    if (diff < DAY) return `in ${Math.ceil(diff / (60 * MINUTE))} Std.`;
    return `in ${Math.ceil(diff / DAY)} Tagen`;
}
