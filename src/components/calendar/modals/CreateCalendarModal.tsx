/**
 * A floating modal for creating a new calendar. Users can set the
 * calendar title and description. Appears centered on screen with
 * a dimmed backdrop.
 * @component
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CreateCalendarModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { useEffect } from "react";

interface CreateCalendarModalProps {
    initialData?: {
        id: string;
        title: string;
    } | null;
    onClose: () => void;
}

export function CreateCalendarModal({ initialData, onClose }: CreateCalendarModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (submitting) return;
        setSubmitting(true);

        try {
            let res;

            if (initialData) {
                res = await fetch(`/api/calendars/${initialData.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title.trim(),
                        description: description.trim(),
                    }),
                });
            } else {
                res = await fetch("/api/calendars", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title.trim() || undefined,
                        description: description.trim() || undefined,
                    }),
                });
            }

            if (res.ok) {
                window.location.reload();
                onClose();
            }
        } finally {
            setSubmitting(false);
        }

        console.log("MODE:", initialData ? "EDIT" : "CREATE");
        console.log("TITLE:", title);
    };

    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
        } else {
            setTitle("");
        }
    }, [initialData]);
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>New Calendar</h2>

                <label className={styles.label}>Title</label>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Calendar"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    autoFocus
                />

                <label className={styles.label}>Description</label>
                <textarea
                    className={styles.textarea}
                    placeholder="Optional"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                />

                <div className={styles.actions}>
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonPrimary
                        label={
                            submitting
                                ? initialData ? "Saving…" : "Creating…"
                                : initialData ? "Save" : "Create"
                        }
                        onClick={handleCreate}
                    />
                </div>
            </div>
        </div>
    );
}
