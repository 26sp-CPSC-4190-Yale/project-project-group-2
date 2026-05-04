/**
 * A floating modal for creating or editing a group within a calendar.
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import styles from "./CreateGroupModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";

const DEFAULT_COLOR = "#6c3ecc";

interface CreateGroupModalProps {
    calendarId: string;
    calendarColor?: string;
    initialData?: {
        id: string;
        name: string;
        notes?: string;
        color?: string;
    } | null;
    onClose: () => void;
}

export function CreateGroupModal({
    calendarId,
    calendarColor,
    initialData,
    onClose,
}: CreateGroupModalProps) {
    const [name, setName] = useState("");
    const [notes, setNotes] = useState("");
    const [color, setColor] = useState(DEFAULT_COLOR);
    const [submitting, setSubmitting] = useState(false);

    const resolvedDefault = (calendarColor && calendarColor !== "none") ? calendarColor : DEFAULT_COLOR;

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setNotes(initialData.notes ?? "");
            setColor(initialData.color && initialData.color !== "none" ? initialData.color : resolvedDefault);
        } else {
            setName("");
            setNotes("");
            setColor(resolvedDefault);
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
                        color,
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
                        color,
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

                <label className={styles.label}>Color</label>
                <div className={styles.colorRow}>
                    <input
                        className={styles.colorInput}
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                    />
                    <span className={styles.colorHex}>{color}</span>
                </div>

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
