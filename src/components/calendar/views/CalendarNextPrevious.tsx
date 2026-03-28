/**
 * Navigation control showing previous/next buttons and a date label
 * that adapts to the current calendar view mode.
 * @component
 */

import styles from "./CalendarNextPrevious.module.css";

export type ViewMode = "Day" | "Week" | "Month";

interface CalendarNextPreviousProps {
    viewMode: ViewMode;
    currentDate: Date;
    onPrevious: () => void;
    onNext: () => void;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const DAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
];

function formatLabel(viewMode: ViewMode, date: Date): string {
    switch (viewMode) {
        case "Day":
            return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
        case "Week":
            return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
        case "Month":
            return `${date.getFullYear()}`;
    }
}

export function CalendarNextPrevious({
    viewMode,
    currentDate,
    onPrevious,
    onNext,
}: CalendarNextPreviousProps) {
    return (
        <div className={styles.container}>
            <img
                src="/CalendarPreviousButton.png"
                alt="Previous"
                className={styles.button}
                onClick={onPrevious}
            />
            <span className={styles.label}>{formatLabel(viewMode, currentDate)}</span>
            <img
                src="/CalendarNextButton.png"
                alt="Next"
                className={styles.button}
                onClick={onNext}
            />
        </div>
    );
}
