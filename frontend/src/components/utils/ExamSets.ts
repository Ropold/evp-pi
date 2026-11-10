import uebung1 from "../../data/uebungen/uebung1.json";
import uebung2 from "../../data/uebungen/uebung2.json";
import uebung3 from "../../data/uebungen/uebung3.json";
import type { ExamSetModel } from "../models/ExamSetModel.ts";

export const EXAM_SETS = [uebung1, uebung2, uebung3] as ExamSetModel[];

export function findExamSet(id: string): ExamSetModel | undefined {
    return EXAM_SETS.find((set) => set.id === id);
}
