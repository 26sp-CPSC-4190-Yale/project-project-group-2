/**
 * Inline confirmation card for an AI-proposed event or task.
 * Shows a compact summary with optional collapsible Details, Confirm/Cancel
 * buttons, and swaps to an "Added" or "Cancelled" state in place.
 * @component
 */

"use client";

import { useState } from "react";
import styles from "./ProposalCard.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { formatItemDate } from "@/lib/formatDate";
import type { ChatProposalItem, ProposalStatus } from "./chatTypes";

interface ProposalCardProps {
    item: ChatProposalItem;
    onStatusChange: (status: ProposalStatus) => void;
    onErrorAppended: (text: string) => void;
    onCalendarMutated: () => void;
}

const ERROR_TEXT = "Something went wrong, try again.";

export function ProposalCard({
    item,
    onStatusChange,
    onErrorAppended,
    onCalendarMutated,
}: ProposalCardProps) {
    const [saving, setSaving] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const summary = buildSummary(item);

    if (item.status === "added") {
        return (
            <div className={styles.card}>
                <div className={styles.confirmedRow}>
                    <svg
                        className={styles.checkIcon}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <span>
                        Added &ldquo;{summary.name}&rdquo; to {summary.calendarTitle} ·{" "}
                        {summary.groupName}.
                    </span>
                </div>
            </div>
        );
    }

    if (item.status === "cancelled") {
        return (
            <div className={`${styles.card} ${styles.cancelled}`}>
                <div className={styles.cancelledRow}>
                    <span>Cancelled.</span>
                </div>
            </div>
        );
    }

    const detailEntries = buildDetailEntries(item);

    async function handleConfirm() {
        if (saving) return;
        setSaving(true);
        try {
            const res = await fetch(item.proposalKind === "event" ? "/api/events" : "/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stripDisplayFields(item)),
            });
            if (!res.ok) {
                onErrorAppended(ERROR_TEXT);
                return;
            }
            onStatusChange("added");
            onCalendarMutated();
        } catch {
            onErrorAppended(ERROR_TEXT);
        } finally {
            setSaving(false);
        }
    }

    function handleCancel() {
        if (saving) return;
        onStatusChange("cancelled");
    }

    return (
        <div className={styles.card}>
            <div className={styles.kindLabel}>
                {item.proposalKind === "event" ? "Event" : "Task"}
            </div>
            <div className={styles.name}>{summary.name}</div>
            <div className={styles.meta}>{summary.when}</div>
            <div className={styles.calGroup}>
                {summary.calendarTitle} · {summary.groupName}
            </div>

            {detailEntries.length > 0 && (
                <>
                    <button
                        type="button"
                        className={styles.detailsToggle}
                        onClick={() => setShowDetails((v) => !v)}
                    >
                        {showDetails ? "Hide details" : "Details"}
                    </button>
                    {showDetails && (
                        <div className={styles.detailsList}>
                            {detailEntries.map(({ label, value }) => (
                                <div key={label}>
                                    <span className={styles.detailLabel}>{label}:</span>
                                    <span>{value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <div className={styles.actions}>
                <ButtonSecondary label="Cancel" onClick={handleCancel} />
                <ButtonPrimary label={saving ? "Saving…" : "Confirm"} onClick={handleConfirm} />
            </div>
        </div>
    );
}

interface ProposalSummary {
    name: string;
    when: string;
    calendarTitle: string;
    groupName: string;
}

function buildSummary(item: ChatProposalItem): ProposalSummary {
    if (item.proposalKind === "event") {
        const d = item.data;
        return {
            name: d.name ?? "(untitled event)",
            when: formatItemDate(d.startAt, d.endAt ?? null, d.allDay ?? false),
            calendarTitle: d.displayCalendarTitle,
            groupName: d.displayGroupName,
        };
    }
    const d = item.data;
    return {
        name: d.name,
        when: formatItemDate(d.dueAt, null, d.allDay ?? false),
        calendarTitle: d.displayCalendarTitle,
        groupName: d.displayGroupName,
    };
}

function buildDetailEntries(item: ChatProposalItem): Array<{ label: string; value: string }> {
    const entries: Array<{ label: string; value: string }> = [];
    if (item.proposalKind === "event") {
        const d = item.data;
        if (d.description) entries.push({ label: "Description", value: d.description });
        if (d.location) entries.push({ label: "Location", value: d.location });
        if (d.link) entries.push({ label: "Link", value: d.link });
        if (typeof d.remindBefore === "number") {
            entries.push({ label: "Reminder", value: `${d.remindBefore} min before` });
        }
    } else {
        const d = item.data;
        if (d.notes) entries.push({ label: "Notes", value: d.notes });
        if (d.location) entries.push({ label: "Location", value: d.location });
        if (d.link) entries.push({ label: "Link", value: d.link });
        if (typeof d.remindBefore === "number") {
            entries.push({ label: "Reminder", value: `${d.remindBefore} min before` });
        }
    }
    return entries;
}

function stripDisplayFields(item: ChatProposalItem) {
    const { displayCalendarTitle: _t, displayGroupName: _g, ...rest } = item.data;
    return rest;
}
