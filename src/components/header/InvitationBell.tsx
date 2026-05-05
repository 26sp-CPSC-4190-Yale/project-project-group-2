/**
 * A header icon that shows pending event invitations. Displays a red
 * badge with the count and a dropdown to accept or decline invitations.
 * @component
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./InvitationBell.module.css";

interface EventInvitation {
    id: string;
    kind: "event";
    status: string;
    event: {
        id: string;
        name: string;
        startAt: string;
    };
    sender: {
        id: string;
        name: string;
        email: string;
    };
}

interface CalendarInvitation {
    id: string;
    kind: "calendar";
    status: string;
    calendar: {
        id: string;
        title: string;
    };
    sender: {
        id: string;
        name: string;
        email: string;
    };
}

type Invitation = EventInvitation | CalendarInvitation;

function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

interface InvitationBellProps {
    onInvitationsChanged?: () => void;
}

export function InvitationBell({ onInvitationsChanged }: InvitationBellProps = {}) {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        Promise.all([
            fetch("/api/invitations?type=received&status=PENDING").then((r) => r.json()),
            fetch("/api/calendar-invitations?type=received&status=PENDING").then((r) => r.json()),
        ])
            .then(([eventData, calData]) => {
                const eventInvs: EventInvitation[] = (eventData.data ?? []).map(
                    (inv: Omit<EventInvitation, "kind">) => ({ ...inv, kind: "event" as const }),
                );
                const calInvs: CalendarInvitation[] = (calData.data ?? []).map(
                    (inv: Omit<CalendarInvitation, "kind">) => ({ ...inv, kind: "calendar" as const }),
                );
                setInvitations([...eventInvs, ...calInvs]);
            })
            .catch(() => setInvitations([]));
    }, [refreshKey]);

    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshKey((k) => k + 1);
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        }
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDropdown]);

    const handleRespond = useCallback(async (inv: Invitation, status: "ACCEPTED" | "DECLINED") => {
        const endpoint = inv.kind === "calendar"
            ? `/api/calendar-invitations/${inv.id}`
            : `/api/invitations/${inv.id}`;

        const res = await fetch(endpoint, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });

        if (res.ok) {
            setInvitations((prev) => prev.filter((i) => i.id !== inv.id));
            onInvitationsChanged?.();
        }
    }, [onInvitationsChanged]);

    return (
        <div className={styles.bellWrapper} ref={wrapperRef}>
            <svg
                className={styles.bellIcon}
                onClick={() => setShowDropdown((v) => !v)}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                />
            </svg>

            {invitations.length > 0 && (
                <span className={styles.badge}>{invitations.length}</span>
            )}

            {showDropdown && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>Invitations</div>
                    {invitations.length === 0 ? (
                        <div className={styles.emptyState}>No pending invitations</div>
                    ) : (
                        invitations.map((inv) => (
                            <div key={inv.id} className={styles.inviteRow}>
                                <span className={styles.eventName}>
                                    {inv.kind === "calendar"
                                        ? inv.calendar.title
                                        : inv.event.name}
                                </span>
                                <span className={styles.senderName}>
                                    From {inv.sender.name}
                                </span>
                                {inv.kind === "event" && (
                                    <span className={styles.eventDate}>
                                        {formatDate(inv.event.startAt)}
                                    </span>
                                )}
                                {inv.kind === "calendar" && (
                                    <span className={styles.eventDate}>Calendar</span>
                                )}
                                <div className={styles.inviteActions}>
                                    <button
                                        className={styles.acceptBtn}
                                        onClick={() => handleRespond(inv, "ACCEPTED")}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className={styles.declineBtn}
                                        onClick={() => handleRespond(inv, "DECLINED")}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
