/**
 * @component
 */

"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./PdfThumbnail.module.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfThumbnailProps {
    fileId: string;
    width?: number;
}

function isRenderablePdfUrl(value: unknown): value is string {
    if (typeof value !== "string" || value.trim() === "") return false;

    try {
        const trimmed = value.trim();
        const parsed = new URL(trimmed, window.location.origin);
        return (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:" ||
            parsed.protocol === "blob:" ||
            (parsed.protocol === "data:" && trimmed.startsWith("data:application/pdf"))
        );
    } catch {
        return false;
    }
}

export function PdfThumbnail({ fileId, width = 180 }: PdfThumbnailProps) {
    const [url, setUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

    useEffect(() => {
        let cancelled = false;
        setUrl(null);
        setStatus("loading");
        fetch(`/api/files/${fileId}/open`)
            .then((res) => res.json())
            .then((json) => {
                const signedUrl = json.data?.url;
                if (cancelled) return;

                if (isRenderablePdfUrl(signedUrl)) {
                    setUrl(signedUrl);
                    setStatus("ready");
                } else {
                    setStatus("unavailable");
                }
            })
            .catch(() => {
                if (!cancelled) setStatus("unavailable");
            });
        return () => { cancelled = true; };
    }, [fileId]);

    if (status === "loading") {
        return (
            <div className={styles.wrapper}>
                <span className={styles.loading}>Loading…</span>
            </div>
        );
    }

    if (status === "unavailable" || !url) {
        return (
            <div className={styles.wrapper}>
                <span className={styles.placeholder}>Preview unavailable</span>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <Document file={url} loading={<span className={styles.loading}>Loading…</span>}>
                <Page
                    pageNumber={1}
                    width={width}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                />
            </Document>
        </div>
    );
}
