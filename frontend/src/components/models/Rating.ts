/** Eigene Einschätzung nach einer Aufgabe */
export type Rating = "schwer" | "mittel" | "leicht";

export const RATINGS: Rating[] = ["schwer", "mittel", "leicht"];

export const RATING_LABELS: Record<Rating, string> = {
    schwer: "Schwer",
    mittel: "Mittel",
    leicht: "Leicht",
};
