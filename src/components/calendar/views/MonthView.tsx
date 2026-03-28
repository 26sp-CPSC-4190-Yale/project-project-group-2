/**
 * A form of the main calendar panel used for showing a view of the schedule for days/weeks of a selected month.
 * @component
 */

import styles from "./MonthView.module.css";
import { EventCard } from "../EventCard";
import type { CalendarEvent } from "../types";

interface MonthViewProps {
    currentDate: Date;
    events: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function buildMonthGrid(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ day: number; inMonth: boolean; date: Date }> = [];

    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        cells.push({ day: d, inMonth: false, date: new Date(year, month - 1, d) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, inMonth: true, date: new Date(year, month, d) });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
        cells.push({ day: d, inMonth: false, date: new Date(year, month + 1, d) });
    }
    return cells;
}

export function MonthView({ currentDate, events, onEventClick }: MonthViewProps) {
    const today = new Date();
    const cells = buildMonthGrid(currentDate);
    const monthLabel = MONTHS[currentDate.getMonth()];

    const weeks: Array<typeof cells> = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    const getEventsForDay = (day: Date) =>
        events.filter((e) => isSameDay(new Date(e.startAt), day));

    return (
        <div className={styles.container}>
            <div className={styles.monthLabel}>{monthLabel}</div>
            <div className={styles.headerRow}>
                {DAY_NAMES.map((name) => (
                    <div key={name} className={styles.dayHeader}>{name}</div>
                ))}
            </div>
            <div className={styles.grid}>
                {weeks.map((week, wi) => (
                    <div key={wi} className={styles.weekRow}>
                        {week.map((cell, ci) => (
                            <div
                                key={ci}
                                className={`${styles.cell} ${!cell.inMonth ? styles.outOfMonth : ""}`}
                            >
                                <span
                                    className={`${styles.dayNumber} ${isSameDay(cell.date, today) ? styles.today : ""}`}
                                >
                                    {cell.day}
                                </span>
                                <div className={styles.cellEvents}>
                                    {getEventsForDay(cell.date).slice(0, 3).map((e) => (
                                        <EventCard
                                            key={e.id}
                                            event={e}
                                            compact
                                            onClick={() => onEventClick?.(e)}
                                        />
                                    ))}
                                    {getEventsForDay(cell.date).length > 3 && (
                                        <span className={styles.moreLabel}>
                                            +{getEventsForDay(cell.date).length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
