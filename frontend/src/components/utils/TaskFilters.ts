import tasksJson from "../../data/tasks.json";
import type { PracticeSettingsModel, ProgressModel, RatingFilter } from "../models/ProgressModel.ts";
import type { TaskModel } from "../models/TaskModel.ts";
import { isDue } from "./RepetitionScheduler.ts";
import { pickRandom } from "./Shuffle.ts";

export const ALL_TASKS = tasksJson as TaskModel[];

export const RATING_FILTER_LABELS: Record<RatingFilter, string> = {
    alle: "Alle",
    neu: "Neu",
    schwer: "Schwer",
    mittel: "Mittel",
    leicht: "Leicht",
};

export function matchesFilter(task: TaskModel, settings: PracticeSettingsModel, progress: ProgressModel): boolean {
    if (settings.category !== "alle" && task.category !== settings.category) return false;

    const entry = progress[task.id];
    if (settings.ratingFilter === "alle") return true;
    if (settings.ratingFilter === "neu") return entry === undefined;
    return entry?.rating === settings.ratingFilter;
}

export function filterTasks(settings: PracticeSettingsModel, progress: ProgressModel): TaskModel[] {
    return ALL_TASKS.filter((task) => matchesFilter(task, settings, progress));
}

/**
 * Nächste Aufgabe wählen:
 * 1. fällige, zufällig gewählt
 * 2. dann neue, zufällig gewählt
 * 3. sonst (alles erledigt) die, die am frühesten wieder dran wäre
 * Die aktuelle Aufgabe wird nur gewählt, wenn es keine andere gibt.
 */
export function pickNextTask(
    settings: PracticeSettingsModel,
    progress: ProgressModel,
    currentId?: string,
    now = Date.now(),
): { task: TaskModel | undefined; ahead: boolean } {
    const candidates = filterTasks(settings, progress);
    const others = candidates.filter((task) => task.id !== currentId);
    const pool = others.length > 0 ? others : candidates;

    const due = pickRandom(pool.filter((task) => progress[task.id] && isDue(progress[task.id], now)));
    if (due) return { task: due, ahead: false };

    const fresh = pickRandom(pool.filter((task) => !progress[task.id]));
    if (fresh) return { task: fresh, ahead: false };

    const upcoming = [...pool].sort((a, b) => progress[a.id].due - progress[b.id].due);
    return { task: upcoming[0], ahead: upcoming.length > 0 };
}

export function countDue(tasks: TaskModel[], progress: ProgressModel, now = Date.now()): number {
    return tasks.filter((task) => progress[task.id] && isDue(progress[task.id], now)).length;
}

export function countNew(tasks: TaskModel[], progress: ProgressModel): number {
    return tasks.filter((task) => !progress[task.id]).length;
}
