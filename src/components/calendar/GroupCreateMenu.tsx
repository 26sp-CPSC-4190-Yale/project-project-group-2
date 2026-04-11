/**
 * A floating modal for creating or editing a group within a calendar.
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import styles from "./TaskCreateMenu.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";

interface GroupCreateMenuProps {
    calendarId: string;
    initialData?: {
        id: string;
        name: string;
        notes?: string;
    } | null;
    onClose: () => void;
}

export function GroupCreateMenu({
    calendarId,
    initialData,
    onClose,
}: GroupCreateMenuProps) {
    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setNotes(initialData.notes ?? "");
        } else {
            setName("");
            setNotes("");
        }
    }, [initialData]);

    const handleSubmit = async () => {
        if (submitting) return;
        if (!name.trim()) return;

        setSubmitting(true);

        try {
            let res;

            if (initialData) {
                res = await fetch(`/api/groups/${initialData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim(),
                        notes: notes.trim() || undefined,
                    }),
                });
            } else {
                res = await fetch("/api/groups", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        calendarId,
                        name: name.trim(),
                        notes: notes.trim() || undefined,
                    }),
                });
            }

            if (res.ok) {
                onClose();
            } else {
                const err = await res.json().catch(() => null);
                console.error("FAILED:", err);
                alert(err?.error || `Failed to ${initialData ? "update" : "create"} group`);
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
                <h2 className={styles.heading}>
                    {initialData ? "Edit Group" : "New Group"}
                </h2>

                <label className={styles.label}>Name</label>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Group name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />

                <label className={styles.label}>Notes</label>
                <textarea
                    className={styles.textarea}
                    placeholder="Optional"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                />

                <div className={styles.actions}>
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonPrimary
                        label={
                            submitting
                                ? initialData ? "Saving…" : "Creating…"
                                : initialData ? "Save" : "Create"
                        }
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}
