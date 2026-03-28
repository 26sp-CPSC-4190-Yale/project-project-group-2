/**
 * A form of the main calendar panel used for showing a view of the schedule for days in a selected 7-day span.
 * @component
 */

import styles from "./WeekView.module.css";
import { EventCard } from "../EventCard";
import type { CalendarEvent } from "../types";

interface WeekViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_HEIGHT = 3;

const HOURS = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 || 12;
    const ampm = i < 12 ? "AM" : "PM";
    return `${h} ${ampm}`;
});

function getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

export function WeekView({ currentDate, events, onEventClick }: WeekViewProps) {
    const weekStart = getWeekStart(currentDate);
    const today = new Date();

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const isToday = (d: Date) => isSameDay(d, today);

    const getEventsForDay = (day: Date, allDay: boolean) =>
        events.filter((e) => {
            const start = new Date(e.startAt);
            return isSameDay(start, day) && e.allDay === allDay;
        });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.gutterHeader} />
                {days.map((d, i) => (
                    <div
                        key={i}
                        className={`${styles.dayHeader} ${isToday(d) ? styles.today : ""}`}
                    >
                        <span className={styles.dayName}>{DAY_NAMES[i]}</span>
                        <span className={styles.dayNumber}>{d.getDate()}</span>
                    </div>
                ))}
            </div>
            <div className={styles.body}>
                <div className={styles.timeGrid} style={{ height: `${24 * HOUR_HEIGHT}rem` }}>
                    {HOURS.map((label, hi) => (
                        <div className={styles.row} key={hi}>
                            <div className={styles.hourLabel}>{label}</div>
                            {days.map((_, di) => (
                                <div className={styles.cell} key={di} />
                            ))}
                        </div>
                    ))}
                    <div className={styles.columnsOverlay}>
                        {days.map((day, di) => (
                            <div className={styles.dayColumn} key={di}>
                                {getEventsForDay(day, false).map((e) => {
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
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
