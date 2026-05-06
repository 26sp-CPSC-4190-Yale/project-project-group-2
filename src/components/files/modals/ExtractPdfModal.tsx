/**
 * @component
 */

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./ExtractPdfModal.module.css";
import type { ExtractedItem } from "@/lib/aiSchemas";
import type { ExtractPdfPrefetchPayload } from "@/types";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { formatItemDate } from "@/lib/formatDate";

type RowItem = ExtractedItem & { included: boolean };

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

    const sectionsContainerRef = useRef<HTMLDivElement>(null);
    const eventsListRef = useRef<HTMLUListElement>(null);
    const tasksListRef = useRef<HTMLUListElement>(null);

    useLayoutEffect(() => {
        const container = sectionsContainerRef.current;
        if (!container) return;

        const recalc = () => {
            const elist = eventsListRef.current;
            const tlist = tasksListRef.current;
            const cont = sectionsContainerRef.current;
            if (!cont) return;

            if (elist) elist.style.maxHeight = "";
            if (tlist) tlist.style.maxHeight = "";

            const E = elist?.scrollHeight ?? 0;
            const T = tlist?.scrollHeight ?? 0;
            const containerHeight = cont.clientHeight;
            const chrome = Math.max(0, cont.scrollHeight - E - T);
            const available = Math.max(0, containerHeight - chrome);

            if (E + T <= available) return;

            const half = available / 2;
            if (E <= half && tlist) {
                tlist.style.maxHeight = `${available - E}px`;
            } else if (T <= half && elist) {
                elist.style.maxHeight = `${available - T}px`;
            } else {
                if (elist) elist.style.maxHeight = `${half}px`;
                if (tlist) tlist.style.maxHeight = `${half}px`;
            }
        };

        recalc();
        const observer = new ResizeObserver(recalc);
        observer.observe(container);
        return () => observer.disconnect();
    }, [items.length]);

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

    function renderList(
        rows: { row: RowItem; index: number }[],
        listRef: React.Ref<HTMLUListElement>,
    ) {
        if (rows.length === 0) return null;
        return (
            <ul className={styles.list} ref={listRef}>
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
                <div className={styles.heading}>Add to calendar</div>

                <div className={styles.sectionsContainer} ref={sectionsContainerRef}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeading}>Events</div>
                        {renderList(eventRows, eventsListRef)}
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeading}>Tasks</div>
                        {renderList(taskRows, tasksListRef)}
                    </div>
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
