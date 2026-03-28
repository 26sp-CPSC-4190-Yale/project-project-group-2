/**
 * Orchestrates the calendar view area: navigation controls, view mode
 * switching, event fetching, and the active calendar view (Day/Week/Month).
 * @component
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import styles from "./CalendarViewLayout.module.css";
import { AddNewButton } from "./AddNewButton";
import { DropDownPrimary } from "@/components/DropDownPrimary";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { CalendarNextPrevious, type ViewMode } from "./CalendarNextPrevious";
import { AddNewMenu } from "../AddNewMenu";
import { EventCardEditMenu } from "../EventCardEditMenu";
import type { CalendarEvent } from "../types";
import type { SidebarCalendar } from "../layout/Sidebar";

interface CalendarViewLayoutProps {
    selectedCalendarId: string | null;
    calendars: SidebarCalendar[];
}

function getDateRange(viewMode: ViewMode, date: Date) {
    switch (viewMode) {
        case "Day": {
            const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            return { start: start.toISOString(), end: end.toISOString() };
        }
        case "Week": {
            const ws = new Date(date);
            ws.setDate(ws.getDate() - ws.getDay());
            ws.setHours(0, 0, 0, 0);
            const we = new Date(ws);
            we.setDate(we.getDate() + 7);
            return { start: ws.toISOString(), end: we.toISOString() };
        }
        case "Month": {
            const first = new Date(date.getFullYear(), date.getMonth(), 1);
            const viewStart = new Date(first);
            viewStart.setDate(viewStart.getDate() - first.getDay());
            const viewEnd = new Date(viewStart);
            viewEnd.setDate(viewEnd.getDate() + 42);
            return { start: viewStart.toISOString(), end: viewEnd.toISOString() };
        }
    }
}

export function CalendarViewLayout({
    selectedCalendarId,
    calendars,
}: CalendarViewLayoutProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("Month");
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [eventRefreshKey, setEventRefreshKey] = useState(0);

    useEffect(() => {
        if (!selectedCalendarId) {
            setEvents([]);
            return;
        }
        const { start, end } = getDateRange(viewMode, currentDate);
        fetch(`/api/events?calendarId=${selectedCalendarId}&start=${start}&end=${end}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.data) setEvents(data.data);
            })
            .catch(() => setEvents([]));
    }, [selectedCalendarId, viewMode, currentDate, eventRefreshKey]);

    const handlePrevious = useCallback(() => {
        setCurrentDate((prev) => {
            const d = new Date(prev);
            switch (viewMode) {
                case "Day": d.setDate(d.getDate() - 1); break;
                case "Week": d.setDate(d.getDate() - 7); break;
                case "Month": d.setMonth(d.getMonth() - 1); break;
            }
            return d;
        });
    }, [viewMode]);

    const handleNext = useCallback(() => {
        setCurrentDate((prev) => {
            const d = new Date(prev);
            switch (viewMode) {
                case "Day": d.setDate(d.getDate() + 1); break;
                case "Week": d.setDate(d.getDate() + 7); break;
                case "Month": d.setMonth(d.getMonth() + 1); break;
            }
            return d;
        });
    }, [viewMode]);

    const handleViewChange = (value: string) => {
        setViewMode(value as ViewMode);
    };

    const handleMenuClose = () => {
        setShowAddMenu(false);
        setEventRefreshKey((k) => k + 1);
    };

    const handleEditClose = () => {
        setEditingEvent(null);
        setEventRefreshKey((k) => k + 1);
    };

    return (
        <div className={styles.container}>
            <div className={styles.buttonRow}>
                <CalendarNextPrevious
                    viewMode={viewMode}
                    currentDate={currentDate}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                />
                <div className={styles.spacer} />
                <DropDownPrimary
                    items={["Month", "Week", "Day"]}
                    defaultValue={viewMode}
                    onChange={handleViewChange}
                    width="5.5rem"
                />
                <AddNewButton onClick={() => setShowAddMenu(true)} />
            </div>
            <div className={styles.view}>
                {viewMode === "Day" && (
                    <DayView
                        currentDate={currentDate}
                        events={events}
                        onEventClick={setEditingEvent}
                    />
                )}
                {viewMode === "Week" && (
                    <WeekView
                        currentDate={currentDate}
                        events={events}
                        onEventClick={setEditingEvent}
                    />
                )}
                {viewMode === "Month" && (
                    <MonthView
                        currentDate={currentDate}
                        events={events}
                        onEventClick={setEditingEvent}
                    />
                )}
            </div>
            {showAddMenu && (
                <AddNewMenu
                    calendars={calendars}
                    defaultCalendarId={selectedCalendarId}
                    onClose={handleMenuClose}
                />
            )}
            {editingEvent && (
                <EventCardEditMenu
                    event={editingEvent}
                    onClose={handleEditClose}
                />
            )}
        </div>
    );
}
