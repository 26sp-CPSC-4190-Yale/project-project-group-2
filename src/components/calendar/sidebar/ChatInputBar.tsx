/**
 * @component
 */

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./ChatInputBar.module.css";

interface ChatInputBarProps {
    placeholderText?: string | null;
    value?: string;
    onChange?: (value: string) => void;
    onSubmit?: () => void;
    disabled?: boolean;
}

export function ChatInputBar({
    placeholderText,
    value: valueProp,
    onChange,
    onSubmit,
    disabled = false,
}: ChatInputBarProps) {
    // Support both controlled and uncontrolled usage so this component remains
    // backwards-compatible with any other place that may still mount it
    // without passing value/onChange.
    const [internalValue, setInternalValue] = useState("");
    const isControlled = valueProp !== undefined;
    const value = isControlled ? (valueProp as string) : internalValue;
    const setValue = (next: string) => {
        if (isControlled) {
            onChange?.(next);
        } else {
            setInternalValue(next);
        }
    };

    const [isMultiline, setIsMultiline] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const measureRef = useRef<HTMLTextAreaElement>(null);

    const canSubmit = !disabled && value.trim().length > 0;

    function handleSubmit() {
        if (!canSubmit) return;
        onSubmit?.();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

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
            className={`${styles.container} ${isMultiline ? styles.multiline : ""} ${disabled ? styles.disabled : ""}`}
        >
            <textarea
                ref={textareaRef}
                className={styles.input}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText ?? ""}
                rows={1}
                disabled={disabled}
            />
            <button
                className={styles.button}
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-label={disabled ? "Sending" : "Send message"}
            >
                {disabled ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        className={`size-6 ${styles.spinner}`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 3a9 9 0 1 0 9 9"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                )}
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
