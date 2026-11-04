import type { Rating } from "./Rating.ts";
import type { TaskCategory } from "./TaskCategory.ts";

export type ProgressEntryModel = {
    rating: Rating;
    /** Karteikasten-Fach: 0 = schwer, steigt mit jedem "leicht" */
    box: number;
    /** Wann die Aufgabe wieder dran ist (Millisekunden) */
    due: number;
    lastSeen: number;
    timesSolved: number;
    timesHelped: number;
};

/** Fortschritt je Aufgaben-ID, gespeichert im localStorage */
export type ProgressModel = Record<string, ProgressEntryModel>;

export type RatingFilter = Rating | "neu" | "alle";

export type PracticeSettingsModel = {
    ratingFilter: RatingFilter;
    category: TaskCategory | "alle";
};
