/**
 * @component
 */

"use client";

import { useState } from "react";
import styles from "./ShareCalendarModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";

interface ShareCalendarModalProps {
    calendarId: string;
    calendarTitle: string;
    onClose: () => void;
}

export function ShareCalendarModal({
    calendarId,
    calendarTitle,
    onClose,
}: ShareCalendarModalProps) {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (submitting || !email.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch("/api/calendar-invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ calendarId, recipientEmail: email.trim() }),
            });
            if (res.ok) {
                onClose();
            } else {
                const err = await res.json().catch(() => null);
                alert(err?.error || "Failed to send invitation");
            }
        } catch {
            alert("Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>Share Calendar</h2>
                <p className={styles.message}>
                    Share <span className={styles.calendarName}>{calendarTitle}</span> with
                    another user by entering their email address.
                </p>

                <label className={styles.label}>Recipient Email</label>
                <input
                    className={styles.input}
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void handleSubmit(); }}
                    autoFocus
                />

                <div className={styles.actions}>
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonPrimary
                        label={submitting ? "Sending…" : "Send"}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}
