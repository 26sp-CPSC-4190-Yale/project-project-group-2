/**
 * A floating modal for creating a new group within a calendar.
 * @component
 */

"use client";

import { useState } from "react";
import styles from "./TaskCreateMenu.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";

interface GroupCreateMenuProps {
    calendarId: string;
    onClose: () => void;
}

export function GroupCreateMenu({
    calendarId,
    onClose,
}: GroupCreateMenuProps) {
    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async () => {
        if (submitting) return;
        if (!name.trim()) return;

        setSubmitting(true);

        try {
            const res = await fetch("/api/groups", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    calendarId,
                    name: name.trim(),
                    notes: notes.trim() || undefined,
                }),
            });

            if (res.ok) {
                onClose();
            } else {
                const err = await res.json().catch(() => null);
                console.error("FAILED:", err);
                alert(err?.error || "Failed to create group");
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
                <h2 className={styles.heading}>New Group</h2>

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
                        label={submitting ? "Creating…" : "Create"}
                        onClick={handleCreate}
                    />
                </div>
            </div>
        </div>
    );
}
