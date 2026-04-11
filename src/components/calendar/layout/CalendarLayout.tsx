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
import { Header } from "../../Header";
import { CalendarCreateMenu } from "../CalendarCreateMenu";
import { TaskCreateMenu } from "../TaskCreateMenu";
import { GroupCreateMenu } from "../GroupCreateMenu";

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
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
    const [groupRefreshKey, setGroupRefreshKey] = useState(0);
    const [taskRefreshKey, setTaskRefreshKey] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [editingCalendar, setEditingCalendar] = useState<SidebarCalendar | null>(null);
    const [editingTask, setEditingTask] = useState<any | null>(null);

    return (
        <div className={styles.container}>
            <Header page="home" avatarUrl={avatarUrl} />
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
                            onOpenCreateCalendar={(calendar) => {
                                if (calendar) {
                                    setEditingCalendar(calendar);
                                } else {
                                    setEditingCalendar(null);
                                }

                                setShowCreateCalendar(true);
                            }}
                            onOpenCreateTask={(task) => {
                                if (task && typeof task === "object" && "id" in task) {
                                    setEditingTask(task);
                                } else {
                                    setEditingTask(null);
                                }

                                setShowCreateTask(true);
                            }}
                            onOpenCreateGroup={() => setShowCreateGroup(true)}
                            groupRefreshKey={groupRefreshKey}
                            onSelectGroup={(ids) => setSelectedGroupIds(ids)}
                            taskRefreshKey={taskRefreshKey}
                            onRefreshTasks={() => setTaskRefreshKey((k) => k + 1)}
                        />
                    </div>
                </div>
                <CalendarViewLayout
                    selectedCalendarId={selectedCalendarId}
                    selectedGroupIds={selectedGroupIds}
                />
            </div>
            {showCreateCalendar && (
                <CalendarCreateMenu
                    initialData={editingCalendar}
                    onClose={() => {
                        setShowCreateCalendar(false);
                        setEditingCalendar(null);
                    }}
                />
            )}
            {showCreateTask && selectedCalendarId && (
                <TaskCreateMenu
                    calendarId={selectedCalendarId}
                    onClose={() => {
                        setShowCreateTask(false);
                        setEditingTask(null);
                        setTaskRefreshKey((k) => k + 1);
                    }}
                />
            )}
            {showCreateGroup && selectedCalendarId && (
                <GroupCreateMenu
                    calendarId={selectedCalendarId}
                    onClose={() => {
                        setShowCreateGroup(false);
                        setGroupRefreshKey((k) => k + 1);
                    }}
                />
            )}
        </div>
    );
}
