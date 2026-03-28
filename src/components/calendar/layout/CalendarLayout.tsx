/**
 * Layout for the app home page, where the calendar lives.
 * Manages which calendar is currently selected and create modals.
 * @component
 */

"use client";

import { useState } from "react";
import styles from "./CalendarLayout.module.css";
import { Sidebar, type SidebarCalendar } from "./Sidebar";
import { CalendarViewLayout } from "../views/CalendarViewLayout";
import { Header } from "./Header";
import { CalendarCreateMenu } from "../CalendarCreateMenu";
import { TaskCreateMenu } from "../TaskCreateMenu";

interface CalendarLayoutProps {
    calendars: SidebarCalendar[];
    avatarUrl?: string | null;
}

export function CalendarLayout({
    calendars,
    avatarUrl,
}: CalendarLayoutProps) {
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(
        calendars.length > 0 ? calendars[0].id : null,
    );
    const [showCreateCalendar, setShowCreateCalendar] = useState(false);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [taskRefreshKey, setTaskRefreshKey] = useState(0);

    return (
        <div className={styles.container}>
            <Header avatarUrl={avatarUrl} />
            <div className={styles.main}>
                <Sidebar
                    calendars={calendars}
                    selectedCalendarId={selectedCalendarId}
                    onSelectCalendar={setSelectedCalendarId}
                    onOpenCreateCalendar={() => setShowCreateCalendar(true)}
                    onOpenCreateTask={() => setShowCreateTask(true)}
                    taskRefreshKey={taskRefreshKey}
                />
                <CalendarViewLayout
                    selectedCalendarId={selectedCalendarId}
                    calendars={calendars}
                />
            </div>
            {showCreateCalendar && (
                <CalendarCreateMenu onClose={() => setShowCreateCalendar(false)} />
            )}
            {showCreateTask && (
                <TaskCreateMenu
                    calendars={calendars}
                    defaultCalendarId={selectedCalendarId}
                    onClose={() => {
                        setShowCreateTask(false);
                        setTaskRefreshKey((k) => k + 1);
                    }}
                />
            )}
        </div>
    );
}
