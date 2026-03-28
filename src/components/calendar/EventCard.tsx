/**
 * A colored bar representing a calendar event. Renders as a time-spanning
 * bar in Day/Week views or a compact chip in Month view.
 * @component
 */

import styles from "./EventCard.module.css";
import type { CalendarEvent } from "./types";

interface EventCardProps {
    event: CalendarEvent;
    style?: React.CSSProperties;
    compact?: boolean;
    onClick?: () => void;
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    const h = d.getHours() % 12 || 12;
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = d.getHours() < 12 ? "AM" : "PM";
    return m === "00" ? `${h} ${ampm}` : `${h}:${m} ${ampm}`;
}

export function EventCard({ event, style, compact, onClick }: EventCardProps) {
    if (compact) {
        return (
            <div className={styles.compact} onClick={onClick}>
                <span className={styles.compactName}>{event.name}</span>
            </div>
        );
    }

    return (
        <div className={styles.bar} style={style} onClick={onClick}>
            <span className={styles.barName}>{event.name}</span>
            {!event.allDay && (
                <span className={styles.barTime}>{formatTime(event.startAt)}</span>
            )}
        </div>
    );
}
