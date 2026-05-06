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

export function PdfThumbnail({ fileId, width = 180 }: PdfThumbnailProps) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/files/${fileId}/open`)
            .then((res) => res.json())
            .then((json) => {
                const signedUrl = json.data?.url;
                if (!cancelled && signedUrl) setUrl(signedUrl);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [fileId]);

    if (!url) {
        return (
            <div className={styles.wrapper}>
                <span className={styles.loading}>Loading…</span>
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
