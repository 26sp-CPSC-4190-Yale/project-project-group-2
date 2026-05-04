/**
 * Layout for the app home page, where the calendar lives.
 * Manages which calendar is currently selected and create modals.
 * @component
 */

"use client";

import { useState } from "react";
import styles from "./CalendarLayout.module.css";
import { SidebarWrapper} from "../sidebar/SidebarWrapper";
import { CalendarViewLayout } from "../views/CalendarViewLayout";
import { Header } from "../../header/Header";
import { CreateCalendarModal } from "../modals/CreateCalendarModal";
import { CreateTaskModal } from "../modals/CreateTaskModal";
import { CreateGroupModal } from "../modals/CreateGroupModal";
import { DefaultSidebar, type SidebarCalendar } from "../sidebar/DefaultSidebar";
import { ChatSidebar } from "../sidebar/ChatSidebar";

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
    const [sharedEventsRefreshKey, setSharedEventsRefreshKey] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [defaultSidebarOpen, setDefaultSidebarOpen] = useState(true);
    const [chatSidebarOpen, setChatSidebarOpen] = useState(false);
    const [editingCalendar, setEditingCalendar] = useState<SidebarCalendar | null>(null);
    const [editingTask, setEditingTask] = useState<any | null>(null);
    const [editingGroup, setEditingGroup] = useState<{ id: string; name: string; notes?: string; color?: string } | null>(null);

    return (
        <div className={styles.container}>
            <Header
                page="home"
                avatarUrl={avatarUrl}
                onInvitationsChanged={() => setSharedEventsRefreshKey((k) => k + 1)}
            />
            <div className={styles.main}>
                <div className={`${styles.sidebarWrapper} ${sidebarCollapsed ? styles.sidebarCollapsed : ""}`}>
                    <button
                        className={styles.defaultToggle}
                        onClick={() => {
                            // If the chat sidebar is being closed by switching away,
                            // also clear the persisted chat thread.
                            if (chatSidebarOpen) {
                                try {
                                    window.localStorage.removeItem("ai-chat:thread:v1");
                                } catch {
                                    // ignore storage failures
                                }
                            }
                            setDefaultSidebarOpen((v) => !v);
                            setChatSidebarOpen(false);

                            if (sidebarCollapsed && !defaultSidebarOpen) {
                                setSidebarCollapsed(false);
                            }

                            if (defaultSidebarOpen) {
                                setSidebarCollapsed(true);
                            }                        
                        }}
                    >
                        <svg width="25" height="18" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 1 H16.5 Q19 1 19 3.5 V10.5 Q19 13 16.5 13 H8.5 Q6.5 13 5 11.5 L2 8.5 Q0 7 2 5.5 L5 2.5 Q6.5 1 8.5 1 Z" fill="currentColor" />
                        </svg>
                    </button>
                    
                    <button
                        className={styles.chatToggle}
                        onClick={() => {
                            // Toggling the chat sidebar away clears the persisted thread
                            // so the user gets a fresh chat next time it opens.
                            if (chatSidebarOpen) {
                                try {
                                    window.localStorage.removeItem("ai-chat:thread:v1");
                                } catch {
                                    // ignore storage failures
                                }
                            }
                            setChatSidebarOpen((v) => !v);
                            setDefaultSidebarOpen(false);

                            if (sidebarCollapsed && !chatSidebarOpen) {
                                setSidebarCollapsed(false);
                            }

                            if (chatSidebarOpen) {
                                setSidebarCollapsed(true);
                            }                        
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                        </svg>
                    </button>
                    <div className={styles.sidebarContent}>
                        <SidebarWrapper>
                        {defaultSidebarOpen ?
                            <DefaultSidebar
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
                                onOpenCreateGroup={(group) => {
                                    if (group) {
                                        setEditingGroup(group);
                                    } else {
                                        setEditingGroup(null);
                                    }
                                    setShowCreateGroup(true);
                                }}
                                groupRefreshKey={groupRefreshKey}
                                onSelectGroup={(ids) => setSelectedGroupIds(ids)}
                                taskRefreshKey={taskRefreshKey}
                                onRefreshTasks={() => setTaskRefreshKey((k) => k + 1)}
                                onRefreshGroups={() => setGroupRefreshKey((k) => k + 1)}
                            />
                        :
                            <ChatSidebar
                                selectedCalendarId={selectedCalendarId}
                                selectedGroupIds={selectedGroupIds}
                                onCalendarMutated={() => {
                                    setTaskRefreshKey((k) => k + 1);
                                    setSharedEventsRefreshKey((k) => k + 1);
                                }}
                            />
                            
                        }
                        </SidebarWrapper>
                    </div>
                </div>
                <CalendarViewLayout
                    selectedCalendarId={selectedCalendarId}
                    selectedGroupIds={selectedGroupIds}
                    sharedEventsRefreshKey={sharedEventsRefreshKey}
                />
            </div>
            {showCreateCalendar && (
                <CreateCalendarModal
                    initialData={editingCalendar}
                    onClose={() => {
                        setShowCreateCalendar(false);
                        setEditingCalendar(null);
                    }}
                />
            )}
            {showCreateTask && selectedCalendarId && (
                <CreateTaskModal
                    calendarId={selectedCalendarId}
                    initialData={editingTask}
                    onClose={() => {
                        setShowCreateTask(false);
                        setEditingTask(null);
                        setTaskRefreshKey((k) => k + 1);
                    }}
                />
            )}
            {showCreateGroup && selectedCalendarId && (
                <CreateGroupModal
                    calendarId={selectedCalendarId}
                    calendarColor={calendars.find((c) => c.id === selectedCalendarId)?.color}
                    initialData={editingGroup}
                    onClose={() => {
                        setShowCreateGroup(false);
                        setEditingGroup(null);
                        setGroupRefreshKey((k) => k + 1);
                    }}
                />
            )}
        </div>
    );
}
