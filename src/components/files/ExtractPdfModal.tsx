"use client";

import { useEffect, useState } from "react";
import styles from "./ExtractPdfModal.module.css";
import type { ExtractedItem } from "@/lib/aiSchemas";
import type { ExtractPdfPrefetchPayload } from "@/types";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";

type RowItem = ExtractedItem & { included: boolean };

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function formatItemDate(dateISO: string, endAtISO: string | null, allDay: boolean) {
    if (allDay) return formatDate(dateISO);
    const start = formatTime(dateISO);
    const date = formatDate(dateISO);
    if (endAtISO) return `${start} – ${formatTime(endAtISO)} · ${date}`;
    return `${start} · ${date}`;
}

interface Props {
    payload: ExtractPdfPrefetchPayload;
    onClose: () => void;
}

export function ExtractPdfModal({ payload, onClose }: Props) {
    const [items, setItems] = useState<RowItem[]>(
        payload.extract.items.map((i) => ({ ...i, included: true })),
    );
    const [groups, setGroups] = useState<Array<{ id: string; name: string; isDefault?: boolean }>>(
        [],
    );
    const [targetCalendarId, setTargetCalendarId] = useState<string | null>(
        payload.extract.defaultCalendarId ?? payload.calendars[0]?.id ?? null,
    );
    const [targetGroupId, setTargetGroupId] = useState<string | null>(
        payload.extract.defaultGroupId ?? null,
    );
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        if (!targetCalendarId) return;
        fetch(`/api/groups?calendarId=${targetCalendarId}`)
            .then((r) => r.json())
            .then((d: { data?: Array<{ id: string; name: string; isDefault?: boolean }> }) => {
                const list = d.data ?? [];
                setGroups(list);
                const def = list.find((g) => g.isDefault)?.id ?? list[0]?.id ?? null;
                setTargetGroupId(def);
            })
            .catch(() => setGroups([]));
    }, [targetCalendarId]);

    async function handleImport() {
        if (!targetCalendarId || !targetGroupId) return;
        setImporting(true);
        const toSave = items.filter((i) => i.included);
        await Promise.allSettled(
            toSave.map((i) => saveItem(i, targetCalendarId, targetGroupId)),
        );
        setImporting(false);
        onClose();
    }

    function toggleIncluded(index: number) {
        setItems((prev) =>
            prev.map((row, i) => (i === index ? { ...row, included: !row.included } : row)),
        );
    }


    const eventRows = items.map((row, index) => ({ row, index })).filter(({ row }) => row.kind === "event");
    const taskRows = items.map((row, index) => ({ row, index })).filter(({ row }) => row.kind === "task");

    function renderList(rows: { row: RowItem; index: number }[]) {
        if (rows.length === 0) return null;
        return (
            <ul className={styles.list}>
                {rows.map(({ row, index }) => (
                    <li key={index} className={styles.row}>
                        <input
                            type="checkbox"
                            checked={row.included}
                            onChange={() => toggleIncluded(index)}
                            aria-label={`Include ${row.name}`}
                        />
                        <div className={styles.rowBody}>
                            <div className={styles.rowName}>
                                {row.name}
                                {row.confidence < 0.5 && (
                                    <span className={styles.lowConf}> Low confidence</span>
                                )}
                            </div>
                            <div className={styles.rowDate}>{formatItemDate(row.dateISO, row.endAtISO, row.allDay)}</div>
                        </div>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>Add to calendar</h2>

<div className={styles.section}>
                    <h3 className={styles.sectionHeading}>Events</h3>
                    {renderList(eventRows)}
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionHeading}>Tasks</h3>
                    {renderList(taskRows)}
                </div>

<div className={styles.actions}>
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonPrimary
                        label={
                            importing
                                ? "Importing…"
                                : `Confirm`
                        }
                        onClick={() => {
                            if (
                                importing ||
                                !targetCalendarId ||
                                !targetGroupId ||
                                items.filter((i) => i.included).length === 0
                            ) {
                                return;
                            }
                            void handleImport();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

async function saveItem(i: ExtractedItem, calendarId: string, groupId: string) {
    if (i.kind === "task") {
        const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                calendarId,
                groupId,
                name: i.name,
                dueAt: i.dateISO,
                allDay: i.allDay,
                notes: i.notes ?? undefined,
                location: i.location ?? undefined,
            }),
        });
        if (!res.ok) throw new Error(await res.text());
    } else {
        const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                calendarId,
                groupId,
                name: i.name,
                startAt: i.dateISO,
                endAt: i.endAtISO ?? undefined,
                allDay: i.allDay,
                description: i.notes ?? undefined,
                location: i.location ?? undefined,
            }),
        });
        if (!res.ok) throw new Error(await res.text());
    }
}
