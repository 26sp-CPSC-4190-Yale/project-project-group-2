/**
 * Sidebar variant that hosts the AI chat. Pre-conversation it shows a centered
 * intro message above the input bar; once the user sends their first message
 * it switches to a full-height white message box layout.
 * @component
 */

"use client";

import { useEffect, useState } from "react";
import { ChatInputBar } from "./ChatInputBar";
import { ChatMessageBox } from "./ChatMessageBox";
import { NewChatButton } from "./NewChatButton";
import styles from "./ChatSidebar.module.css";
import type { AiChatRequestBody, AiChatResponseBody } from "@/types";
import type { ChatItem, ChatProposalItem, ProposalStatus } from "./types";
import { formatItemDate } from "@/lib/formatDate";

const STORAGE_KEY = "ai-chat:thread:v1";
const ERROR_TEXT = "Something went wrong, try again.";

interface ChatSidebarProps {
    selectedCalendarId: string | null;
    selectedGroupIds: string[];
    onCalendarMutated: () => void;
}

export function ChatSidebar({
    selectedCalendarId,
    selectedGroupIds,
    onCalendarMutated,
}: ChatSidebarProps) {
    const [messages, setMessages] = useState<ChatItem[]>([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(false);

    // Hydrate from localStorage on the client only, after the initial render,
    // to avoid SSR/CSR hydration mismatches.
    useEffect(() => {
        const stored = loadFromStorage();
        if (stored.length > 0) {
            setMessages(stored);
        }
    }, []);

    // Persist whenever the thread has content. We only WRITE here, never
    // remove — clearing is handled explicitly by handleNewChat and by the
    // chat-toggle handler in CalendarLayout. 
    useEffect(() => {
        if (messages.length === 0) return;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages }));
        } catch {
            // ignore storage failures (quota, private mode)
        }
    }, [messages]);

    async function handleSend() {
        const text = draft.trim();
        if (!text || loading) return;
        setDraft("");
        setLoading(true);

        const userMessage: ChatItem = { kind: "user", text };
        const thinking: ChatItem = { kind: "thinking" };
        setMessages((prev) => [...prev, userMessage, thinking]);

        // Build request from the messages we'll have AFTER this turn's user msg.
        const priorChatMessages = messagesForApi([...messages, userMessage]);
        const body: AiChatRequestBody = {
            messages: priorChatMessages,
            context: {
                page: "calendar",
                selectedCalendarId,
                selectedGroupIds,
                currentDateISO: new Date().toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
        };

        try {
            const res = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                appendAfterThinking({ kind: "error", text: ERROR_TEXT });
                return;
            }
            const json = (await res.json()) as { data?: AiChatResponseBody; error?: string };
            const data = json.data;
            if (!data) {
                appendAfterThinking({ kind: "error", text: ERROR_TEXT });
                return;
            }
            appendAfterThinking(responseToChatItem(data));
        } catch {
            appendAfterThinking({ kind: "error", text: ERROR_TEXT });
        } finally {
            setLoading(false);
        }
    }

    function appendAfterThinking(item: ChatItem) {
        setMessages((prev) => {
            const withoutThinking = prev.filter((m) => m.kind !== "thinking");
            return [...withoutThinking, item];
        });
    }

    function handleProposalStatusChange(index: number, status: ProposalStatus) {
        setMessages((prev) =>
            prev.map((m, i) => {
                if (i !== index) return m;
                if (m.kind !== "proposal") return m;
                return { ...m, status };
            }),
        );
    }

    function handleErrorAppended(text: string) {
        setMessages((prev) => [...prev, { kind: "error", text }]);
    }

    function handleNewChat() {
        setMessages([]);
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
    }

    if (messages.length === 0) {
        return (
            <>
                <div className={styles.introText}>I&apos;ll plan when you&apos;re ready.</div>
                <ChatInputBar
                    placeholderText="Edit your calendar."
                    value={draft}
                    onChange={setDraft}
                    onSubmit={handleSend}
                    disabled={loading}
                />
            </>
        );
    }

    return (
        <div className={styles.active}>
            <NewChatButton onClick={handleNewChat} />
            <ChatMessageBox
                messages={messages}
                onProposalStatusChange={handleProposalStatusChange}
                onErrorAppended={handleErrorAppended}
                onCalendarMutated={onCalendarMutated}
            />
            <div className={styles.inputRow}>
                <ChatInputBar
                    placeholderText="Edit your calendar."
                    value={draft}
                    onChange={setDraft}
                    onSubmit={handleSend}
                    disabled={loading}
                />
            </div>
        </div>
    );
}

function loadFromStorage(): ChatItem[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as { messages?: ChatItem[] };
        if (!Array.isArray(parsed.messages)) return [];
        return parsed.messages.filter((m) => m.kind !== "thinking");
    } catch {
        return [];
    }
}

function proposalToText(m: ChatProposalItem): string {
    const isEvent = m.proposalKind === "event";
    const name = m.data.name ?? "(untitled)";
    const when = isEvent
        ? formatItemDate(m.data.startAt, m.data.endAt ?? null, m.data.allDay ?? false)
        : formatItemDate(m.data.dueAt, null, m.data.allDay ?? false);
    const where = `${m.data.displayCalendarTitle} · ${m.data.displayGroupName}`;
    const kind = isEvent ? "event" : "task";

    if (m.status === "added")
        return `I scheduled the ${kind} "${name}" (${when}) in ${where}.`;
    if (m.status === "cancelled")
        return `The proposal for "${name}" was cancelled.`;
    return `I proposed the ${kind} "${name}" (${when}) in ${where} — awaiting confirmation.`;
}

function messagesForApi(items: ChatItem[]): AiChatRequestBody["messages"] {
    return items
        .flatMap((m): AiChatRequestBody["messages"] => {
            if (m.kind === "user") return [{ role: "user", content: m.text }];
            if (m.kind === "assistant") return [{ role: "assistant", content: m.text }];
            if (m.kind === "proposal") return [{ role: "assistant", content: proposalToText(m) }];
            return [];
        });
}

function responseToChatItem(res: AiChatResponseBody): ChatItem {
    if (res.kind === "text" || res.kind === "question") {
        return { kind: "assistant", text: res.text };
    }
    if (res.kind === "proposal") {
        if (res.proposalKind === "event") {
            return {
                kind: "proposal",
                proposalKind: "event",
                data: res.data,
                status: "pending",
            };
        }
        return {
            kind: "proposal",
            proposalKind: "task",
            data: res.data,
            status: "pending",
        };
    }
    // res.kind === "error"
    return { kind: "error", text: ERROR_TEXT };
}
