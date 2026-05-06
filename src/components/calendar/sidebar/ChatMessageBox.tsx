/**
 * White rounded message-list container for the chat sidebar.
 * Renders user/assistant/error/thinking bubbles plus inline ProposalCards.
 * @component
 */

"use client";

import { useEffect, useRef } from "react";
import styles from "./ChatMessageBox.module.css";
import type { ChatItem, ProposalStatus } from "./types";
import { ProposalCard } from "./ProposalCard";

interface ChatMessageBoxProps {
    messages: ChatItem[];
    onProposalStatusChange: (index: number, status: ProposalStatus) => void;
    onErrorAppended: (text: string) => void;
    onCalendarMutated: () => void;
}

export function ChatMessageBox({
    messages,
    onProposalStatusChange,
    onErrorAppended,
    onCalendarMutated,
}: ChatMessageBoxProps) {
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages]);

    return (
        <div className={styles.box} ref={boxRef}>
            {messages.map((m, i) => {
                if (m.kind === "user") {
                    return (
                        <div key={i} className={`${styles.row} ${styles.rowRight}`}>
                            <div className={`${styles.bubble} ${styles.user}`}>{m.text}</div>
                        </div>
                    );
                }
                if (m.kind === "assistant") {
                    return (
                        <div key={i} className={`${styles.row} ${styles.rowLeft}`}>
                            <div className={`${styles.bubble} ${styles.assistant}`}>{m.text}</div>
                        </div>
                    );
                }
                if (m.kind === "error") {
                    return (
                        <div key={i} className={`${styles.row} ${styles.rowLeft}`}>
                            <div className={`${styles.bubble} ${styles.error}`}>{m.text}</div>
                        </div>
                    );
                }
                if (m.kind === "thinking") {
                    return (
                        <div key={i} className={`${styles.row} ${styles.rowLeft}`}>
                            <div
                                className={`${styles.bubble} ${styles.assistant} ${styles.thinking}`}
                                aria-label="Assistant is thinking"
                            >
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                            </div>
                        </div>
                    );
                }
                // proposal
                return (
                    <div key={i} className={styles.proposalRow}>
                        <ProposalCard
                            item={m}
                            onStatusChange={(status) => onProposalStatusChange(i, status)}
                            onErrorAppended={onErrorAppended}
                            onCalendarMutated={onCalendarMutated}
                        />
                    </div>
                );
            })}
        </div>
    );
}
