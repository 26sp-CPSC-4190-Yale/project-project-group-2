"use client";

import { useState } from "react";
import styles from "./EditFileModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { useCalendars } from "@/hooks/useCalendars";

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
    const { calendars } = useCalendars();

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
