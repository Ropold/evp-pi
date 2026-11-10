import type { TaskModel } from "./TaskModel.ts";

/** Eine Übung als Probeklausur: Aufgaben werden der Reihe nach abgefragt */
export type ExamSetModel = {
    id: string;
    /** Kurzname für den Button, z. B. "Übung 2" */
    label: string;
    title: string;
    /** Herkunft, z. B. die PDF-Dateien der Übung */
    source: string;
    /** Hinweise und Ausgangslage, formatiert wie Aufgabentexte */
    intro: string;
    tasks: TaskModel[];
};
