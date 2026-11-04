import type { PracticeSettingsModel, ProgressModel, RatingFilter } from "../models/ProgressModel.ts";
import { CATEGORY_LABELS, TASK_CATEGORIES, type TaskCategory } from "../models/TaskCategory.ts";
import { filterTasks, RATING_FILTER_LABELS } from "../utils/TaskFilters.ts";

type PracticeFilterProps = {
    settings: PracticeSettingsModel;
    progress: ProgressModel;
    onChange: (settings: PracticeSettingsModel) => void;
};

const RATING_FILTERS: RatingFilter[] = ["alle", "neu", "schwer", "mittel", "leicht"];

export default function PracticeFilter({ settings, progress, onChange }: Readonly<PracticeFilterProps>) {
    return (
        <div className="practice-filter">
            <div className="filter-chips" role="group" aria-label="Nach eigener Bewertung filtern">
                {RATING_FILTERS.map((filter) => {
                    const count = filterTasks({ ...settings, ratingFilter: filter }, progress).length;
                    const active = settings.ratingFilter === filter;
                    return (
                        <button
                            key={filter}
                            type="button"
                            className={`chip ${active ? "chip-active" : ""} chip-${filter}`}
                            aria-pressed={active}
                            onClick={() => onChange({ ...settings, ratingFilter: filter })}
                        >
                            {RATING_FILTER_LABELS[filter]} <span className="chip-count">{count}</span>
                        </button>
                    );
                })}
            </div>

            <label className="filter-category">
                <span>Bereich</span>
                <select
                    value={settings.category}
                    onChange={(event) => onChange({ ...settings, category: event.target.value as TaskCategory | "alle" })}
                >
                    <option value="alle">Alle Bereiche</option>
                    {TASK_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                            {CATEGORY_LABELS[category]}
                        </option>
                    ))}
                </select>
            </label>
        </div>
    );
}
