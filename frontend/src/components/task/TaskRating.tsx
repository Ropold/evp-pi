import { RATINGS, RATING_LABELS, type Rating } from "../models/Rating.ts";

type TaskRatingProps = {
    helpUsed: boolean;
    onRate: (rating: Rating) => void;
};

export default function TaskRating({ helpUsed, onRate }: Readonly<TaskRatingProps>) {
    if (helpUsed) {
        return (
            <div className="task-rating">
                <p>Mit Tipp oder Lösung gelöst – die Aufgabe zählt als <strong>Schwer</strong> und kommt bald wieder.</p>
                <button type="button" className="button button-primary" onClick={() => onRate("schwer")}>
                    Weiter
                </button>
            </div>
        );
    }

    return (
        <div className="task-rating">
            <p>Wie schwer war das für dich?</p>
            <div className="task-rating-buttons">
                {RATINGS.map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        className={`button rating-${rating}`}
                        onClick={() => onRate(rating)}
                    >
                        {RATING_LABELS[rating]}
                    </button>
                ))}
            </div>
        </div>
    );
}
