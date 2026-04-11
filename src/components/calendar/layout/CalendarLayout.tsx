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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className={styles.container}>
            <Header avatarUrl={avatarUrl} />
            <div className={styles.main}>
                <div className={`${styles.sidebarWrapper} ${sidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
                    <button
                        className={styles.collapseToggle}
                        onClick={() => setSidebarCollapsed((v) => !v)}
                        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <svg width="25" height="18" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 1 H16.5 Q19 1 19 3.5 V10.5 Q19 13 16.5 13 H8.5 Q6.5 13 5 11.5 L2 8.5 Q0 7 2 5.5 L5 2.5 Q6.5 1 8.5 1 Z" fill="currentColor" />
                        </svg>
                    </button>
                    <div className={styles.sidebarContent}>
                        <Sidebar
                            calendars={calendars}
                            selectedCalendarId={selectedCalendarId}
                            onSelectCalendar={setSelectedCalendarId}
                            onOpenCreateCalendar={() => setShowCreateCalendar(true)}
                            onOpenCreateTask={() => setShowCreateTask(true)}
                            taskRefreshKey={taskRefreshKey}
                        />
                    </div>
                </div>
                <CalendarViewLayout
                    selectedCalendarId={selectedCalendarId}
                />
            </div>
            {showCreateCalendar && (
                <CalendarCreateMenu onClose={() => setShowCreateCalendar(false)} />
            )}
            {showCreateTask && selectedCalendarId && (
                <TaskCreateMenu
                    calendarId={selectedCalendarId}
                    onClose={() => {
                        setShowCreateTask(false);
                        setTaskRefreshKey((k) => k + 1);
                    }}
                />
            )}
        </div>
    );
}
