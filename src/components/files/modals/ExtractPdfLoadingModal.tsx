"use client";

import { useEffect, useState } from "react";
import styles from "./ExtractPdfLoadingModal.module.css";
import type { ExtractPdfPrefetchPayload } from "@/types";
import type { ExtractedItem } from "@/lib/aiSchemas";
import { ButtonSecondary } from "@/components/ButtonSecondary";

interface Props {
    fileId: string;
    fileName: string;
    onDone: (payload: ExtractPdfPrefetchPayload) => void;
    onClose: () => void;
}

export function ExtractPdfLoadingModal({ fileId, fileName, onDone, onClose }: Props) {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setError(null);
            try {
                const [extractRes, calRes] = await Promise.all([
                    fetch("/api/ai/extract-pdf", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            fileId,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            todayISO: new Date().toISOString(),
                        }),
                    }),
                    fetch("/api/calendars"),
                ]);
                const extractJson = (await extractRes.json()) as {
                    data?: {
                        items: ExtractedItem[];
                        defaultCalendarId: string | null;
                        defaultGroupId: string | null;
                        detectedTimezone: string | null;
                        unparseableNotes: string | null;
                    };
                    error?: string;
                };
                const calJson = (await calRes.json()) as {
                    data?: Array<{ id: string; title: string }>;
                    error?: string;
                };

                if (cancelled) return;
                if (!extractRes.ok) {
                    setError(extractJson.error ?? "Extraction failed");
                    return;
                }
                if (!calRes.ok) {
                    setError(calJson.error ?? "Could not load calendars");
                    return;
                }
                const ext = extractJson.data;
                const cals = calJson.data ?? [];
                if (!ext) {
                    setError("Invalid response from server");
                    return;
                }

                onDone({
                    extract: {
                        items: ext.items ?? [],
                        defaultCalendarId: ext.defaultCalendarId,
                        defaultGroupId: ext.defaultGroupId,
                        detectedTimezone: ext.detectedTimezone,
                        unparseableNotes: ext.unparseableNotes,
                    },
                    calendars: cals,
                });
            } catch {
                if (!cancelled) setError("Network error");
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [fileId, onDone]);

    return (
        <div className={styles.backdrop}>
            <div className={styles.card}>
                <h2 className={styles.title}>Loading plans...</h2>
                <p className={styles.subtitle}>{fileName}</p>
                {!error && <div className={styles.spinner} aria-hidden />}
                {error && <p className={styles.error}>{error}</p>}
                {error && <ButtonSecondary label="Close" onClick={onClose} />}
            </div>
        </div>
    );
}
