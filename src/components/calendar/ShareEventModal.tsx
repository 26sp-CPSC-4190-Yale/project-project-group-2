/**
 * A floating modal for sharing an event with another user by email.
 * Sends an invitation via the invitations API.
 * @component
 */

"use client";

import { useState } from "react";
import styles from "./ShareEventModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";

interface ShareEventModalProps {
    eventId: string;
    eventName: string;
    onClose: () => void;
}

export function ShareEventModal({
    eventId,
    eventName,
    onClose,
}: ShareEventModalProps) {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (submitting) return;
        if (!email.trim()) return;

        setSubmitting(true);

        try {
            const res = await fetch("/api/invitations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    eventId,
                    recipientEmail: email.trim(),
                }),
            });

            if (res.ok) {
                onClose();
            } else {
                const err = await res.json().catch(() => null);
                alert(err?.error || "Failed to send invitation");
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
                <h2 className={styles.heading}>Share Event</h2>
                <p className={styles.message}>
                    Share <span className={styles.eventName}>{eventName}</span> with
                    another user by entering their email address.
                </p>

                <label className={styles.label}>Recipient Email</label>
                <input
                    className={styles.input}
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
