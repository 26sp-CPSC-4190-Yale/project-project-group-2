/**
 * A critical component for the layout of the main page which functions as a collapsable sidebar. Contains items that go in the side bar.
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import { CalendarListItem } from "../CalendarListItem";
import { TaskListItem } from "../TaskListItem";
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
}

interface SidebarProps {
    calendars: SidebarCalendar[];
    selectedCalendarId: string | null;
    onSelectCalendar: (id: string) => void;
    onOpenCreateCalendar?: () => void;
    onOpenCreateTask?: () => void;
    taskRefreshKey?: number;
}

export function Sidebar({
    calendars,
    selectedCalendarId,
    onSelectCalendar,
    onOpenCreateCalendar,
    onOpenCreateTask,
    taskRefreshKey = 0,
}: SidebarProps) {
    const defaultCalTitle = calendars.find((c) => c.id === selectedCalendarId)?.title ?? "";
    const [taskCalendarTitle, setTaskCalendarTitle] = useState(defaultCalTitle);
    const [tasks, setTasks] = useState<SidebarTask[]>([]);

    const taskCalendarId = calendars.find((c) => c.title === taskCalendarTitle)?.id;

    useEffect(() => {
        if (!taskCalendarId) {
            setTasks([]);
            return;
        }
        fetch(`/api/tasks?calendarId=${taskCalendarId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.data) setTasks(data.data);
            })
            .catch(() => setTasks([]));
    }, [taskCalendarId, taskRefreshKey]);

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

    return (
        <div className={styles.container}>
            <div className={styles.calendarHeader}>
                <div className={styles.headerText}>
                    MY CALENDARS
                </div>
                <div className={styles.createButton}>
                    <CreateListItemButton onClick={onOpenCreateCalendar} />
                </div>
            </div>
            <div className={styles.calendarList}>
                {calendars.map((cal) => (
                    <CalendarListItem
                        key={cal.id}
                        calendarName={cal.title}
                        active={cal.id === selectedCalendarId}
                        onClick={() => onSelectCalendar(cal.id)}
                    />
                ))}
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
                {tasks.map((task) => (
                    <TaskListItem
                        key={task.id}
                        taskName={task.name}
                        checked={task.completed}
                        onToggle={() => handleToggleTask(task.id, task.completed)}
                    />
                ))}
            </div>
        </div>
    );
}
