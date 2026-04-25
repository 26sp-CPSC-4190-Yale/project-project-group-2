/**
 * @component
 */

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./ChatInputBar.module.css";

interface ChatInputBarProps {
    placeholderText?: string | null;
}

export function ChatInputBar({
    placeholderText,
}: ChatInputBarProps) {
    const [value, setValue] = useState("");
    const [isMultiline, setIsMultiline] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const measureRef = useRef<HTMLTextAreaElement>(null);

    useLayoutEffect(() => {
        const ta = textareaRef.current;
        const measure = measureRef.current;
        if (!ta || !measure) return;

        // Decide multiline using a hidden mirror <textarea> that's pinned to
        // the inline-mode width. Because it shares font, padding, and
        // wrap-behavior with the visible textarea, its scrollHeight tells us
        // exactly whether the text would wrap in inline mode — independent of
        // the visible textarea's current rendered width (which itself changes
        // with the layout state and would otherwise create feedback loops).
        const lineHeightPx =
            parseFloat(getComputedStyle(measure).lineHeight) || 0;
        const wrapsInInline = measure.scrollHeight > lineHeightPx * 1.5;

        const desiredMultiline = value.includes("\n") || wrapsInInline;

        // If the layout needs to change, defer height sizing to the next
        // pass so scrollHeight is measured at the textarea's final width.
        // Otherwise we'd briefly size for the narrow inline width and then
        // snap back down once the wide multiline layout takes effect.
        if (desiredMultiline !== isMultiline) {
            setIsMultiline(desiredMultiline);
            return;
        }

        ta.style.height = "auto";
        ta.style.height = `${ta.scrollHeight}px`;
    }, [value, isMultiline]);

    return (
        <div
            className={`${styles.container} ${isMultiline ? styles.multiline : ""}`}
        >
            <textarea
                ref={textareaRef}
                className={styles.input}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholderText ?? ""}
                rows={1}
            />
            <button className={styles.button} type="button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </button>
            <textarea
                ref={measureRef}
                className={styles.measure}
                value={value}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                rows={1}
                onChange={() => {}}
            />
        </div>
    );
}
