"use client";

import { useEffect, useState } from "react";
import styles from "./EditFileModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";

interface CalendarOption {
    id: string;
    title: string;
}

export interface EditFileChanges {
    name?: string;
    calendarId?: string | null;
}

interface EditFileModalProps {
    currentName: string;
    currentCalendarId: string | null;
    onConfirm: (changes: EditFileChanges) => void;
    onClose: () => void;
}

export function EditFileModal({
    currentName,
    currentCalendarId,
    onConfirm,
    onClose,
}: EditFileModalProps) {
    const [name, setName] = useState(currentName);
    const [calendarId, setCalendarId] = useState<string>(currentCalendarId ?? "");
    const [calendars, setCalendars] = useState<CalendarOption[]>([]);

    useEffect(() => {
        fetch("/api/calendars")
            .then((res) => res.json())
            .then((json) => {
                const cals = json.data ?? json;
                setCalendars(cals);
            })
            .catch(() => {});
    }, []);

    const handleSave = () => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const changes: EditFileChanges = {};
        if (trimmed !== currentName) changes.name = trimmed;
        const newCalendarId = calendarId || null;
        if (newCalendarId !== currentCalendarId) changes.calendarId = newCalendarId;

        onConfirm(changes);
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>Edit File</h2>

                <label className={styles.label}>Name</label>
                <input
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && name.trim()) handleSave();
                    }}
                />

                <label className={styles.label}>Calendar</label>
                <select
                    className={styles.select}
                    value={calendarId}
                    onChange={(e) => setCalendarId(e.target.value)}
                >
                    <option value="">None</option>
                    {calendars.map((cal) => (
                        <option key={cal.id} value={cal.id}>
                            {cal.title}
                        </option>
                    ))}
                </select>

                <div className={styles.actions}>
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonPrimary label="Save" onClick={handleSave} />
                </div>
            </div>
        </div>
    );
}
