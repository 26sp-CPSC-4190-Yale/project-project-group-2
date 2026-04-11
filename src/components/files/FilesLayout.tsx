"use client";

import { useEffect, useState } from "react";
import styles from "./FilesLayout.module.css";
import { Header } from "../Header";

interface FileItem {
    id: string;
    name: string;
    path: string;
}

interface FilesLayoutProps{
    avatarUrl?: string | null;
}

export function FilesLayout({
    avatarUrl,
}: FilesLayoutProps) {
    const [files, setFiles] = useState<FileItem[]>([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    async function fetchFiles() {
        const res = await fetch("/api/files");
        const data = await res.json();
        setFiles(data);
    }

    async function openFile(fileId: string) {
        const res = await fetch(`/api/files/${fileId}/open`);
        const data = await res.json();

        if (data.url) {
            window.open(data.url, "_blank");
        }
    }

    function handleOpenFile(file: FileItem) {
        window.open(file.path, "_blank");
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const newFile = await res.json();

        setFiles((prev) => [...prev, newFile]);
    }

    return (
        <div className={styles.container}>
            <Header page="files" avatarUrl={avatarUrl} />
            <h1 className={styles.title}>All your schedules, one place.</h1>

            <div className={styles.grid}>
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={styles.card}
                        onClick={() => openFile(file.id)}
                    >
                        <div className={styles.icon}>📄</div>
                        <div className={styles.name}>{file.name}</div>
                    </div>
                ))}

                {/* Upload Card */}
                <label className={styles.uploadCard}>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleUpload}
                        hidden
                    />
                    <div className={styles.plus}>+</div>
                </label>
            </div>
        </div>
    );
}