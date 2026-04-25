/**
 * A floating modal for editing or deleting an existing event.
 * Pre-populated with the event's current values.
 * @component
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./EditEventModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { ShareEventModal } from "./ShareEventModal";
import type { CalendarEvent } from "../types";
import { ButtonDanger } from "@/components/ButtonDanger";

interface EditEventModalProps {
    event: CalendarEvent;
    onClose: () => void;
    readOnly?: boolean;
}

function toDateValue(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTimeValue(iso: string): string {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function EditEventModal({ event, onClose, readOnly = false }: EditEventModalProps) {
    const [name, setName] = useState(event.name);
    const [allDay, setAllDay] = useState(event.allDay);
    const [startDate, setStartDate] = useState(toDateValue(event.startAt));
    const [startTime, setStartTime] = useState(toTimeValue(event.startAt));
    const [endDate, setEndDate] = useState(event.endAt ? toDateValue(event.endAt) : "");
    const [endTime, setEndTime] = useState(event.endAt ? toTimeValue(event.endAt) : "");
    const [description, setDescription] = useState(event.description ?? "");
    const [notes, setNotes] = useState(event.notes ?? "");
    const [link, setLink] = useState(event.link ?? "");
    const [location, setLocation] = useState(event.location ?? "");
    const [remindBefore, setRemindBefore] = useState(
        event.remindBefore !== null ? String(event.remindBefore) : "",
    );
    const [submitting, setSubmitting] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        if (submitting) return;
        setSubmitting(true);

        const startAt = allDay
            ? new Date(`${startDate}T00:00:00`).toISOString()
            : new Date(`${startDate}T${startTime || "00:00"}`).toISOString();

        let endAt: string | null = null;
        if (endDate) {
            endAt = allDay
                ? new Date(`${endDate}T23:59:59`).toISOString()
                : new Date(`${endDate}T${endTime || "23:59"}`).toISOString();
        }

        try {
            const res = await fetch(`/api/events/${event.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim() || undefined,
                    startAt,
                    endAt,
                    allDay,
                    description: description.trim() || null,
                    notes: notes.trim() || null,
                    link: link.trim() || null,
                    location: location.trim() || null,
                    remindBefore: remindBefore ? parseInt(remindBefore, 10) : null,
                }),
            });
            if (res.ok) {
                router.refresh();
                onClose();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
            if (res.ok) {
                router.refresh();
                onClose();
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (readOnly) {
        return (
            <div className={styles.backdrop} onClick={onClose}>
                <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                    <h2 className={styles.heading}>Shared Event</h2>

                    <label className={styles.label}>Name</label>
                    <div className={styles.readOnlyValue}>{event.name}</div>

                    <div className={styles.row}>
                        <div className={styles.column}>
                            <label className={styles.label}>Start Date</label>
                            <div className={styles.readOnlyValue}>{startDate}</div>
                        </div>
                        {!event.allDay && (
                            <div className={styles.column}>
                                <label className={styles.label}>Start Time</label>
                                <div className={styles.readOnlyValue}>{startTime}</div>
                            </div>
                        )}
                    </div>

                    {(endDate || event.endAt) && (
                        <div className={styles.row}>
                            <div className={styles.column}>
                                <label className={styles.label}>End Date</label>
                                <div className={styles.readOnlyValue}>{endDate || "—"}</div>
                            </div>
                            {!event.allDay && (
                                <div className={styles.column}>
                                    <label className={styles.label}>End Time</label>
                                    <div className={styles.readOnlyValue}>{endTime || "—"}</div>
                                </div>
                            )}
                        </div>
                    )}

                    {event.description && (
                        <>
                            <label className={styles.label}>Description</label>
                            <div className={styles.readOnlyValue}>{event.description}</div>
                        </>
                    )}

                    {event.notes && (
                        <>
                            <label className={styles.label}>Notes</label>
                            <div className={styles.readOnlyValue}>{event.notes}</div>
                        </>
                    )}

                    {event.location && (
                        <>
                            <label className={styles.label}>Location</label>
                            <div className={styles.readOnlyValue}>{event.location}</div>
                        </>
                    )}

                    {event.link && (
                        <>
                            <label className={styles.label}>Link</label>
                            <div className={styles.readOnlyValue}>{event.link}</div>
                        </>
                    )}

                    <div className={styles.actions}>
                        <ButtonSecondary label="Close" onClick={onClose} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>Edit Event</h2>

                <label className={styles.label}>Name</label>
                <input
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />

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
                        <label className={styles.label}>Start Date</label>
                        <input
                            className={styles.input}
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    {!allDay && (
                        <div className={styles.column}>
                            <label className={styles.label}>Start Time</label>
                            <input
                                className={styles.input}
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>End Date</label>
                        <input
                            className={styles.input}
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    {!allDay && (
                        <div className={styles.column}>
                            <label className={styles.label}>End Time</label>
                            <input
                                className={styles.input}
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <label className={styles.label}>Description</label>
                <textarea
                    className={styles.textarea}
                    placeholder="Optional"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                />

                <label className={styles.label}>Notes</label>
                <textarea
                    className={styles.textarea}
                    placeholder="Optional"
                    value={notes}
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
                        value={remindBefore}
                        onChange={(e) => setRemindBefore(e.target.value)}
                    />
                    <span className={styles.remindUnit}>minutes</span>
                </div>

                <label className={styles.label}>Link</label>
                <input
                    className={styles.input}
                    type="url"
                    placeholder="Optional"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />

                <label className={styles.label}>Location</label>
                <input
                    className={styles.input}
                    type="text"
                    placeholder="Optional"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />

                <div className={styles.actions}>
                    <ButtonDanger label="Delete" onClick={handleDelete} />
                    <ButtonSecondary label="Share" onClick={() => setShowShareModal(true)} />
                    <div className={styles.actionSpacer} />
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonPrimary
                        label={submitting ? "Saving…" : "Save"}
                        onClick={handleSave}
                    />
                </div>
            </div>
            {showShareModal && (
                <ShareEventModal
                    eventId={event.id}
                    eventName={event.name}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
}
