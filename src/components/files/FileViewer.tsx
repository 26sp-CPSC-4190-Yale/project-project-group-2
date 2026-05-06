/**
 * @component
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./FileViewer.module.css";
import { Header } from "../header/Header";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface FileViewerProps {
    fileId: string;
    fileName: string;
    avatarUrl?: string | null;
}

export function FileViewer({ fileId, fileName, avatarUrl }: FileViewerProps) {
    const router = useRouter();
    const [url, setUrl] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        fetch(`/api/files/${fileId}/open`)
            .then((res) => res.json())
            .then((json) => {
                const signedUrl = json.data?.url;
                if (signedUrl) setUrl(signedUrl);
            })
            .catch(() => {});
    }, [fileId]);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    }, []);

    return (
        <div className={styles.container}>
            <Header page="files" avatarUrl={avatarUrl} />
            <div className={styles.toolbar}>
                <button
                    className={styles.backButton}
                    onClick={() => router.push("/files")}
                >
                    ← Back
                </button>
                <div className={styles.fileName}>{fileName}</div>
                {numPages > 1 && (
                    <div className={styles.pageControls}>
                        <button
                            className={styles.pageButton}
                            disabled={pageNumber <= 1}
                            onClick={() => setPageNumber((p) => p - 1)}
                        >
                            ‹
                        </button>
                        <span className={styles.pageInfo}>
                            {pageNumber} / {numPages}
                        </span>
                        <button
                            className={styles.pageButton}
                            disabled={pageNumber >= numPages}
                            onClick={() => setPageNumber((p) => p + 1)}
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>
            <div className={styles.viewer}>
                {!url ? (
                    <div className={styles.loading}>Loading document…</div>
                ) : (
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<div className={styles.loading}>Loading document…</div>}
                    >
                        <Page
                            pageNumber={pageNumber}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            width={800}
                        />
                    </Document>
                )}
            </div>
        </div>
    );
}
