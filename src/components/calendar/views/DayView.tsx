/**
 * A form of the main calendar panel used for showing a view of the schedule for a selected day.
 * @component
 */

import styles from "./DayView.module.css";
import { EventCard } from "./EventCard";
import type { CalendarEvent } from "../types";

interface DayViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
}

const HOUR_HEIGHT = 3;

const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 || 12;
    const ampm = i < 12 ? "AM" : "PM";
    return `${h} ${ampm}`;
});

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

export function DayView({ currentDate, events, onEventClick }: DayViewProps) {
    const today = new Date();
    const isToday = isSameDay(currentDate, today);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayLabel = `${dayNames[currentDate.getDay()]} ${currentDate.getDate()}`;

    const dayEvents = events.filter((e) => {
        const start = new Date(e.startAt);
        return isSameDay(start, currentDate) && !e.allDay;
    });

    const allDayEvents = events.filter((e) => {
        const start = new Date(e.startAt);
        return isSameDay(start, currentDate) && e.allDay;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.gutterHeader} />
                <div className={`${styles.dayHeader} ${isToday ? styles.today : ""}`}>
                    {dayLabel}
                </div>
            </div>
            {allDayEvents.length > 0 && (
                <div className={styles.allDayRow}>
                    <div className={styles.allDayLabel}>All day</div>
                    <div className={styles.allDayEvents}>
                        {allDayEvents.map((e) => (
                            <EventCard
                                key={e.id}
                                event={e}
                                compact
                                onClick={() => onEventClick?.(e)}
                            />
                        ))}
                    </div>
                </div>
            )}
            <div className={styles.body}>
                <div className={styles.timeGrid} style={{ height: `${24 * HOUR_HEIGHT}rem` }}>
                    {HOURS.map((label, i) => (
                        <div className={styles.row} key={i}>
                            <div className={styles.hourLabel}>{label}</div>
                            <div className={styles.cell} />
                        </div>
                    ))}
                    <div className={styles.eventsOverlay}>
                        {dayEvents.map((e) => {
                            const start = new Date(e.startAt);
                            const startH = start.getHours() + start.getMinutes() / 60;
                            let duration = 1;
                            if (e.endAt) {
                                const end = new Date(e.endAt);
                                duration = Math.max(
                                    (end.getHours() + end.getMinutes() / 60) - startH,
                                    0.5,
                                );
                            }
                            return (
                                <EventCard
                                    key={e.id}
                                    event={e}
                                    style={{
                                        top: `${startH * HOUR_HEIGHT}rem`,
                                        height: `${duration * HOUR_HEIGHT}rem`,
                                    }}
                                    onClick={() => onEventClick?.(e)}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
