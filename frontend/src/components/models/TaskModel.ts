import type { TaskCategory } from "./TaskCategory.ts";
import type { TaskCheckModel } from "./TaskCheckModel.ts";
import type { TaskType } from "./TaskType.ts";
import type { ScenarioName } from "../utils/filesystem/Scenarios.ts";

export type TaskModel = {
    id: string;
    category: TaskCategory;
    type: TaskType;
    /** Bezeichnung in der Probeklausur, z. B. "Aufgabe 5a" */
    title?: string;
    text: string;
    /** Ausgangssystem (Standard: kannliste) */
    scenario?: ScenarioName;
    /** Befehle, die vor der Aufgabe als root ausgeführt werden (Ausgangslage) */
    setup?: string[];
    /** Angemeldeter Benutzer (Standard: anna) */
    user?: string;
    /** Startverzeichnis (Standard: Home) */
    cwd?: string;
    /** Bei Fragen: Auswahlmöglichkeiten statt Freitext */
    choices?: string[];
    /** Tipps in Stufen, vom groben zum genauen */
    hints: string[];
    solutions: string[];
    /** true = alle Lösungen nacheinander ausführen, sonst sind es Alternativen */
    solutionIsSequence?: boolean;
    explanation: string;
    check: TaskCheckModel;
};
