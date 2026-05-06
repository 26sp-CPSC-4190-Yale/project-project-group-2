/**
 * @component
 */

"use client";

import { useState, useRef } from "react";
import styles from "./UploadFileModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { useCalendars } from "@/hooks/useCalendars";

interface UploadFileModalProps {
    onUpload: (file: File, calendarId: string | null) => void;
    onClose: () => void;
}

export function UploadFileModal({ onUpload, onClose }: UploadFileModalProps) {
    const { calendars } = useCalendars();
    const [selectedCalendarId, setSelectedCalendarId] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async () => {
        if (!selectedFile || uploading) return;
        setUploading(true);
        onUpload(selectedFile, selectedCalendarId || null);
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>Upload File</h2>

                <label className={styles.label}>PDF File</label>
                <input
                    ref={fileInputRef}
                    className={styles.fileInput}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />

                <label className={styles.label}>Calendar</label>
                <select
                    className={styles.select}
                    value={selectedCalendarId}
                    onChange={(e) => setSelectedCalendarId(e.target.value)}
                >
                    <option value="">None</option>
                    {calendars.map((cal) => (
                        <option key={cal.id} value={cal.id}>
                            {cal.title}
                        </option>
                    ))}
                </select>

                <div className={styles.actions}>
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonPrimary
                        label={uploading ? "Uploading…" : "Upload"}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}
