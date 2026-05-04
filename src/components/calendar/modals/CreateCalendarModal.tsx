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

const DEFAULT_COLOR = "#6c3ecc";

interface CreateCalendarModalProps {
    initialData?: {
        id: string;
        title: string;
        color?: string;
    } | null;
    onClose: () => void;
}

export function CreateCalendarModal({ initialData, onClose }: CreateCalendarModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState(DEFAULT_COLOR);
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
                        color,
                    }),
                });
            } else {
                res = await fetch("/api/calendars", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: title.trim() || undefined,
                        description: description.trim() || undefined,
                        color,
                    }),
                });
            }

            if (res.ok) {
                router.refresh();
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
            setColor(initialData.color && initialData.color !== "none" ? initialData.color : DEFAULT_COLOR);
        } else {
            setTitle("");
            setColor(DEFAULT_COLOR);
        }
    }, [initialData]);
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>{initialData ? "Edit Calendar" : "New Calendar"}</h2>

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
                        onClick={handleCreate}
                    />
                </div>
            </div>
        </div>
    );
}
