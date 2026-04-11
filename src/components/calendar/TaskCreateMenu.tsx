/**
 * A floating modal for creating a new task. Users can set all task
 * fields. Appears centered on screen with a dimmed backdrop.
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./TaskCreateMenu.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { DropDownSecondary } from "@/components/DropDownSecondary";

interface GroupOption {
    id: string;
    name: string;
}

interface TaskCreateMenuProps {
    calendarId: string;
    onClose: () => void;

    initialData?: {
        id: string;
        name: string;
        // add more if needed later
    } | null;
}

export function TaskCreateMenu({
    calendarId,
    onClose,
    initialData,
}: TaskCreateMenuProps) {
    const [name, setName] = useState("");
    const [groups, setGroups] = useState<GroupOption[]>([]);
    const [selectedGroupName, setSelectedGroupName] = useState("");
    const [allDay, setAllDay] = useState(true);
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [notes, setNotes] = useState("");
    const [remindBefore, setRemindBefore] = useState("");
    const [link, setLink] = useState("");
    const [location, setLocation] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!calendarId) return;
        fetch(`/api/groups?calendarId=${calendarId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.data) {
                    setGroups(data.data);
                    if (data.data.length > 0) {
                        setSelectedGroupName(data.data[0].name);
                    }
                }
            })
            .catch(() => setGroups([]));
    }, [calendarId]);

    const handleCreate = async () => {
        if (submitting) return;
        if (!name.trim()) return;
        if (!dueDate) return;
        if (!calendarId) return;

        const selectedGroup = groups.find((g) => g.name === selectedGroupName);

        setSubmitting(true);

        const isEdit = !!initialData?.id;

        const dueAtISO = new Date(
            allDay
                ? `${dueDate}T00:00:00`
                : `${dueDate}T${dueTime || "00:00"}`
        ).toISOString();

        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    dueAt: dueAtISO,
                    allDay,
                    calendarId,
                    groupId: selectedGroup?.id,
                    notes: notes.trim() || undefined,
                    remindBefore: remindBefore ? parseInt(remindBefore, 10) : undefined,
                    link: link.trim() || undefined,
                    location: location.trim() || undefined,
                }),
            });

            if (res.ok) {
                onClose();
            } else {
                const err = await res.json().catch(() => null);
                console.error("FAILED:", err);
                alert(err?.error || "Failed to save task");
            }
        } catch (err) {
            console.error("Request failed:", err);
            alert("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>New Task</h2>

                <label className={styles.label}>Name</label>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Task name"
                    value={name || ""}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />

                <label className={styles.label}>Group</label>
                <div className={styles.dropdownRow}>
                    <DropDownSecondary
                        items={groups.map((g) => g.name)}
                        defaultValue={selectedGroupName}
                        onChange={setSelectedGroupName}
                        width="100%"
                    />
                </div>

                <div
                    className={styles.checkboxRow}
                    onClick={() => setAllDay((prev) => !prev)}
                >
                    <div className={`${styles.checkbox} ${allDay ? styles.checked : ""}`}>
                        {allDay && <div className={styles.checkmark} />}
                    </div>
                    <span className={styles.checkboxLabel}>All day</span>
                </div>

                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Due Date</label>
                        <input
                            className={styles.input}
                            type="date"
                            value={dueDate || ""}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    {!allDay && (
                        <div className={styles.column}>
                            <label className={styles.label}>Due Time</label>
                            <input
                                className={styles.input}
                                type="time"
                                value={dueTime || ""}
                                onChange={(e) => setDueTime(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <label className={styles.label}>Notes</label>
                <textarea
                    className={styles.textarea}
                    placeholder="Optional"
                    value={notes || ""}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                />

                <label className={styles.label}>Remind Before</label>
                <div className={styles.remindRow}>
                    <input
                        className={styles.remindInput}
                        type="number"
                        min="0"
                        placeholder="—"
                        value={remindBefore || ""}
                        onChange={(e) => setRemindBefore(e.target.value)}
                    />
                    <span className={styles.remindUnit}>minutes</span>
                </div>

                <label className={styles.label}>Link</label>
                <input
                    className={styles.input}
                    type="url"
                    placeholder="Optional"
                    value={link || ""}
                    onChange={(e) => setLink(e.target.value)}
                />

                <label className={styles.label}>Location</label>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Optional"
                    value={location || ""}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <div className={styles.actions}>
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonPrimary
                        label={submitting ? "Creating…" : "Create"}
                        onClick={handleCreate}
                    />
                </div>
            </div>
        </div>
    );
}
