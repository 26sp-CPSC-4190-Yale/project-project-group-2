/**
 * A floating modal for creating a new event. Users can set all event
 * fields. Appears centered on screen with a dimmed backdrop.
 * @component
 */

"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import styles from "./CreateEventModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { DropDownSecondary } from "@/components/DropDownSecondary";

interface GroupOption {
    id: string;
    name: string;
}

interface CreateEventModalProps {
    calendarId: string;
    onClose: () => void;
}

export function CreateEventModal({
    calendarId,
    onClose,
}: CreateEventModalProps) {
    const [name, setName] = useState("");
    const [groups, setGroups] = useState<GroupOption[]>([]);
    const [selectedGroupName, setSelectedGroupName] = useState("");
    const [allDay, setAllDay] = useState(true);
    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate, setEndDate] = useState("");
    const [endTime, setEndTime] = useState("");
    const [description, setDescription] = useState("");
    const [notes, setNotes] = useState("");
    const [link, setLink] = useState("");
    const [location, setLocation] = useState("");
    const [remindBefore, setRemindBefore] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const formId = useId();
    const router = useRouter();

    useEffect(() => {
        if (!calendarId) return;
        fetch(`/api/groups?calendarId=${calendarId}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.data) {
                    setGroups(data.data);
                    if (data.data.length > 0) {
                        setSelectedGroupName(data.data[0].name);
                    }
                }
            })
            .catch(() => setGroups([]));
    }, [calendarId]);

    const handleCreate = async () => {
        if (submitting) return;
        if (!startDate) return;
        if (!calendarId) return;

        const selectedGroup = groups.find((g) => g.name === selectedGroupName);

        setSubmitting(true);

        const startAt = allDay
            ? new Date(`${startDate}T00:00:00`).toISOString()
            : new Date(`${startDate}T${startTime || "00:00"}`).toISOString();

        let endAt: string | undefined;
        if (endDate) {
            endAt = allDay
                ? new Date(`${endDate}T23:59:59`).toISOString()
                : new Date(`${endDate}T${endTime || "23:59"}`).toISOString();
        }

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    calendarId,
                    groupId: selectedGroup?.id,
                    name: name.trim() || undefined,
                    startAt,
                    endAt,
                    allDay,
                    description: description.trim() || undefined,
                    notes: notes.trim() || undefined,
                    link: link.trim() || undefined,
                    location: location.trim() || undefined,
                    remindBefore: remindBefore ? parseInt(remindBefore, 10) : undefined,
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

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>New Event</h2>

                <label className={styles.label} htmlFor={`${formId}-name`}>
                    Name
                </label>
                <input
                    id={`${formId}-name`}
                    className={styles.input}
                    type="text"
                    placeholder="New Event"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                />

                <label className={styles.label}>Group</label>
                <div className={styles.dropdownRow}>
                    <DropDownSecondary
                        items={groups.map((g) => g.name)}
                        defaultValue={selectedGroupName}
                        onChange={setSelectedGroupName}
                        width="100%"
                    />
                </div>

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
                        <label className={styles.label} htmlFor={`${formId}-start-date`}>
                            Start Date
                        </label>
                        <input
                            id={`${formId}-start-date`}
                            className={styles.input}
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    {!allDay && (
                        <div className={styles.column}>
                            <label className={styles.label} htmlFor={`${formId}-start-time`}>
                                Start Time
                            </label>
                            <input
                                id={`${formId}-start-time`}
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
                        <label className={styles.label} htmlFor={`${formId}-end-date`}>
                            End Date
                        </label>
                        <input
                            id={`${formId}-end-date`}
                            className={styles.input}
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    {!allDay && (
                        <div className={styles.column}>
                            <label className={styles.label} htmlFor={`${formId}-end-time`}>
                                End Time
                            </label>
                            <input
                                id={`${formId}-end-time`}
                                className={styles.input}
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <label className={styles.label} htmlFor={`${formId}-description`}>
                    Description
                </label>
                <textarea
                    id={`${formId}-description`}
                    className={styles.textarea}
                    placeholder="Optional"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                />

                <label className={styles.label} htmlFor={`${formId}-notes`}>
                    Notes
                </label>
                <textarea
                    id={`${formId}-notes`}
                    className={styles.textarea}
                    placeholder="Optional"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                />

                <label className={styles.label} htmlFor={`${formId}-remind-before`}>
                    Remind Before
                </label>
                <div className={styles.remindRow}>
                    <input
                        id={`${formId}-remind-before`}
                        className={styles.remindInput}
                        type="number"
                        min="0"
                        placeholder="—"
                        value={remindBefore}
                        onChange={(e) => setRemindBefore(e.target.value)}
                    />
                    <span className={styles.remindUnit}>minutes</span>
                </div>

                <label className={styles.label} htmlFor={`${formId}-link`}>
                    Link
                </label>
                <input
                    id={`${formId}-link`}
                    className={styles.input}
                    type="url"
                    placeholder="Optional"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />

                <label className={styles.label} htmlFor={`${formId}-location`}>
                    Location
                </label>
                <input
                    id={`${formId}-location`}
                    className={styles.input}
                    type="text"
                    placeholder="Optional"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
