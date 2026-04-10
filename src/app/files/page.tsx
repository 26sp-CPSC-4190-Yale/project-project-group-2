"use client";

import { useEffect, useState } from "react";
import styles from "./FilesPage.module.css";

interface FileItem {
    id: number;
    name: string;
    path: string;
}

export default function FilesPage() {
    const [files, setFiles] = useState<FileItem[]>([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    async function fetchFiles() {
        const res = await fetch("/api/files");
        const data = await res.json();
        setFiles(data);
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
            <h1 className={styles.title}>Your Files</h1>

            <div className={styles.grid}>
                {files.map((file) => (
                    <div
                        key={file.id}
                        className={styles.card}
                        onClick={() => handleOpenFile(file)}
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