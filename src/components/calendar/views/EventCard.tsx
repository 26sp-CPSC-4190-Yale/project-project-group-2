/**
 * A colored bar representing a calendar event. Renders as a time-spanning
 * bar in Day/Week views or a compact chip in Month view.
 * @component
 */

import styles from "./EventCard.module.css";
import type { CalendarEvent } from "../types";

const DEFAULT_COLOR = "#6c3ecc";

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
    const effectiveColor = (event.color && event.color !== "none") ? event.color : DEFAULT_COLOR;
    const colorVars = { "--cal-color": effectiveColor } as React.CSSProperties;

    if (compact) {
        return (
            <div
                className={`${styles.compact} ${event.isShared ? styles.shared : ""}`}
                style={colorVars}
                onClick={onClick}
            >
                <span className={styles.compactName}>{event.name}</span>
            </div>
        );
    }

    return (
        <div
            className={`${styles.bar} ${event.isShared ? styles.shared : ""}`}
            style={{ ...colorVars, ...style }}
            onClick={onClick}
        >
            <span className={styles.barName}>{event.name}</span>
            {!event.allDay && (
                <span className={styles.barTime}>{formatTime(event.startAt)}</span>
            )}
        </div>
    );
}
