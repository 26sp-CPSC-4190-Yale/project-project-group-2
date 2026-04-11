/**
 * A critical component for the layout of the main page which functions as a collapsable sidebar. Contains items that go in the side bar.
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { CalendarListItem } from "../CalendarListItem";
import { TaskListItem } from "../TaskListItem";
import { GroupListItem } from "../GroupListItem";
import { CreateListItemButton } from "../CreateListItemButton";
import { ButtonSecondary } from "@/components/ButtonSecondary";

export interface SidebarCalendar {
    id: string;
    title: string;
    color?: string;
}

interface SidebarTask {
    id: string;
    name: string;
    completed: boolean;
    dueAt?: string;
}

interface SidebarGroup {
    id: string;
    name: string;
    isDefault: boolean;
}

interface SidebarProps {
    calendars: SidebarCalendar[];
    selectedCalendarId: string | null;
    onSelectCalendar: (id: string) => void;
    onOpenCreateCalendar?: (calendar?: SidebarCalendar) => void;
    onOpenCreateTask?: (task?: any) => void;
    onOpenCreateGroup?: () => void;
    onSelectGroup?: (groupIds: string[]) => void;
    groupRefreshKey?: number;
    taskRefreshKey?: number;
    onRefreshTasks?: () => void;
}

export function Sidebar({
    calendars,
    selectedCalendarId,
    onSelectCalendar,
    onOpenCreateCalendar,
    onOpenCreateTask,
    onOpenCreateGroup,
    onSelectGroup,
    onRefreshTasks,
    groupRefreshKey = 0,
    taskRefreshKey = 0,
}: SidebarProps) {
    const defaultCalTitle = calendars.find((c) => c.id === selectedCalendarId)?.title ?? "";
    const [taskCalendarTitle, setTaskCalendarTitle] = useState(defaultCalTitle);
    const [tasks, setTasks] = useState<SidebarTask[]>([]);
    const [groups, setGroups] = useState<SidebarGroup[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());
    const [deleteCalendar, setDeleteCalendar] = useState<SidebarCalendar | null>(null);
    const taskCalendarId = calendars.find((c) => c.title === taskCalendarTitle)?.id;
    const [deleteTask, setDeleteTask] = useState<SidebarTask | null>(null);

    // Fetch groups whenever the selected calendar changes
    useEffect(() => {
        if (!selectedCalendarId) {
            setGroups([]);
            setSelectedGroupIds(new Set());
            onSelectGroup?.([]);
            return;
        }
        fetch(`/api/groups?calendarId=${selectedCalendarId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.data) {
                    setGroups(data.data);
                    // all groups start checked
                    const allIds = new Set<string>(data.data.map((g: SidebarGroup) => g.id));
                    setSelectedGroupIds(allIds);
                    onSelectGroup?.(Array.from(allIds));
                }
            })
            .catch(() => setGroups([]));
    }, [selectedCalendarId, groupRefreshKey]);

    // Fetch tasks whenever the selected calendar changes
    useEffect(() => {
        if (!selectedCalendarId) {
            setTasks([]);
            return;
        }
        const groupParams = Array.from(selectedGroupIds).map((id) => `&groupId=${id}`).join("");
        fetch(`/api/tasks?calendarId=${selectedCalendarId}${groupParams}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.data) setTasks(data.data);
            })
            .catch(() => setTasks([]));
    }, [selectedCalendarId, selectedGroupIds, taskRefreshKey]);

    const handleToggleGroup = (groupId: string) => {
        const newSet = new Set(selectedGroupIds);
        if (newSet.has(groupId)) {
            newSet.delete(groupId);
        } else {
            newSet.add(groupId);
        }
        setSelectedGroupIds(newSet);
        onSelectGroup?.(Array.from(newSet));
    };

    const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
        setTasks((prev) =>
            prev.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t),
        );

        await fetch(`/api/tasks/${taskId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !currentCompleted }),
        });
    };

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const filteredTasks = tasks
        .filter((task) => {
            if (!task.dueAt) {
                return false;
            }

            const due = new Date(task.dueAt);

            return due >= now && due <= sevenDaysFromNow;
        })
        .sort((a, b) => {
            return new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime();
        });

    function isDueSoon(dueAt?: string) {
        if (!dueAt) return false;

        const due = new Date(dueAt);

        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const dueDay = new Date(due);
        dueDay.setHours(0, 0, 0, 0);

        const diffMs = dueDay.getTime() - today.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        return diffDays <= 3 && diffDays >= 0;
    }

    return (
        <div className={styles.container}>
            <div className={styles.calendarHeader}>
                <div className={styles.headerText}>
                    MY CALENDARS
                </div>
                <div className={styles.createButton}>
                    <CreateListItemButton onClick={() => onOpenCreateCalendar?.(undefined)} />
                </div>
            </div>
            <div className={styles.calendarList}>
                {calendars.map((cal) => (
                    <CalendarListItem
                        key={cal.id}
                        calendarName={cal.title}
                        active={cal.id === selectedCalendarId}
                        onClick={() => onSelectCalendar(cal.id)}

                        onEdit={() => {
                            console.log("edit calendar", cal);
                            onOpenCreateCalendar?.(cal);
                        }}

                        onDelete={() => {
                            if (cal.title === "My Calendar") return;
                            setDeleteCalendar(cal);
                        }}

                        isDefault={cal.title === "My Calendar"}
                    />
                ))}
            </div>

            <div className={styles.separatorBar} />

            <div className={styles.taskHeader}>
                <div className={styles.headerText}>
                    GROUPS
                </div>
                <div className={styles.createButton}>
                    <CreateListItemButton onClick={onOpenCreateGroup} />
                </div>
            </div>
            <div className={styles.taskList}>
                {groups.map((group) => (
                    <GroupListItem
                        key={group.id}
                        groupName={group.name}
                        selected={selectedGroupIds.has(group.id)}
                        onToggle={() => handleToggleGroup(group.id)}
                    />
                ))}
                {groups.length === 0 && (
                    <div className={styles.emptyState}>
                        No groups yet
                    </div>
                )}
            </div>

            <div className={styles.separatorBar} />

            <div className={styles.taskHeader}>
                <div className={styles.headerText}>
                    TASKS
                </div>
                <div className={styles.createButton}>
                    <CreateListItemButton onClick={onOpenCreateTask} />
                </div>
            </div>
            <ButtonSecondary
                label="View All Tasks"
                width="14.5rem"
            />
            <div className={styles.taskList}>
                {filteredTasks.map((task) => (
                <TaskListItem
                    key={task.id}
                    taskName={task.name}
                    checked={task.completed}
                    onToggle={() => handleToggleTask(task.id, task.completed)}
                    isDueSoon={isDueSoon(task.dueAt)}

                    onEdit={() => {
                        console.log("edit task", task);
                        onOpenCreateTask?.(task);
                    }}

                    onDelete={() => {
                        setDeleteTask(task);
                    }}
                />
                ))}
                {filteredTasks.length === 0 && (
                    <div className={styles.emptyState}>
                        No upcoming tasks 🎉
                    </div>
                )}
            </div>
            {deleteCalendar && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modal}>
                        <h3>Delete Calendar</h3>
                        <p>Are you sure you want to delete "{deleteCalendar.title}"?</p>

                        <div className={styles.modalActions}>
                            <button onClick={() => setDeleteCalendar(null)}>
                                Cancel
                            </button>

                            <button
                                className={styles.deleteButton}
                                onClick={async () => {
                                    await fetch(`/api/calendars/${deleteCalendar.id}`, {
                                        method: "DELETE",
                                    });

                                    setDeleteCalendar(null);
                                    window.location.reload();
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        {deleteTask && (
            <div className={styles.modalBackdrop}>
                <div className={styles.modal}>
                    <h3>Delete Task</h3>
                    <p>Are you sure you want to delete "{deleteTask.name}"?</p>

                    <div className={styles.modalActions}>
                        <button onClick={() => setDeleteTask(null)}>
                            Cancel
                        </button>

                        <button
                            className={styles.deleteButton}
                            onClick={async () => {
                                await fetch(`/api/tasks/${deleteTask.id}`, {
                                    method: "DELETE",
                                });

                                setDeleteTask(null);
                                onRefreshTasks?.();
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>

    );
}
