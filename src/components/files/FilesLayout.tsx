"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./FilesLayout.module.css";
import { Header } from "../header/Header";
import { SearchBar } from "./SearchBar";
import { ActionMenu } from "@/components/ActionMenu";
import { EditFileModal, type EditFileChanges } from "./modals/EditFileModal";
import { DeleteFileModal } from "./modals/DeleteFileModal";
import { UploadFileModal } from "./modals/UploadFileModal";
import { ExtractPdfModal } from "./modals/ExtractPdfModal";
import { ExtractPdfLoadingModal } from "./modals/ExtractPdfLoadingModal";
import type { ExtractPdfPrefetchPayload } from "@/types";

const PdfThumbnail = dynamic(
    () => import("./PdfThumbnail").then((mod) => mod.PdfThumbnail),
    { ssr: false }
);

interface FileItem {
    id: string;
    name: string;
    storagePath: string;
    calendarId: string | null;
    calendar: { id: string; title: string } | null;
}

interface FilesLayoutProps {
    avatarUrl?: string | null;
}

export function FilesLayout({ avatarUrl }: FilesLayoutProps) {
    const router = useRouter();
    const [files, setFiles] = useState<FileItem[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editTarget, setEditTarget] = useState<FileItem | null>(null);
    const [extractTarget, setExtractTarget] = useState<FileItem | null>(null);
    const [extractPrefetch, setExtractPrefetch] = useState<ExtractPdfPrefetchPayload | null>(
        null,
    );
    const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null);
    const [showUpload, setShowUpload] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

    const filteredFiles = useMemo(
        () =>
            files.filter((f) =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        [files, searchQuery]
    );

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        }
        if (openMenuId) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openMenuId]);

    async function fetchFiles() {
        const res = await fetch("/api/files");
        const json = await res.json();
        setFiles(json.data ?? []);
    }

    async function handleUpload(file: File, calendarId: string | null) {
        const formData = new FormData();
        formData.append("file", file);
        if (calendarId) formData.append("calendarId", calendarId);

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        if (res.ok) {
            const json = await res.json();
            setFiles((prev) => [json.data, ...prev]);
        }
        setShowUpload(false);
    }

    async function handleEdit(fileId: string, changes: EditFileChanges) {
        if (Object.keys(changes).length === 0) {
            setEditTarget(null);
            return;
        }

        const res = await fetch(`/api/files/${fileId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(changes),
        });

        if (res.ok) {
            const json = await res.json();
            setFiles((prev) => prev.map((f) => (f.id === fileId ? json.data : f)));
        }
        setEditTarget(null);
    }

    async function handleDelete(fileId: string) {
        const res = await fetch(`/api/files/${fileId}`, { method: "DELETE" });

        if (res.ok) {
            setFiles((prev) => prev.filter((f) => f.id !== fileId));
        }
        setDeleteTarget(null);
    }

    return (
        <div className={styles.container}>
            <Header page="files" avatarUrl={avatarUrl} />
            <div className={styles.header}>
                All your schedules, one place.
                <SearchBar
                    placeholder="SEARCH FILES"
                    width="31.3125rem"
                    value={searchQuery}
                    onChange={setSearchQuery}
                />
            </div>
            <div className={styles.grid}>
                <div className={styles.uploadCaption}>
                    <div
                        className={styles.uploadCard}
                        onClick={() => setShowUpload(true)}
                    >
                        <div className={styles.plus}>+</div>
                    </div>
                    <div className={styles.calendarName}>ADD FILE</div>
                </div>
                {filteredFiles.map((file) => (
                    <div key={file.id} className={styles.fileItem}>
                        <div
                            className={styles.card}
                            onClick={() => router.push(`/files/${file.id}`)}
                        >
                            <div className={styles.preview}>
                                <PdfThumbnail fileId={file.id} />
                            </div>
                            <div
                                className={styles.menuWrapper}
                                ref={openMenuId === file.id ? menuRef : undefined}
                            >
                                <button
                                    className={styles.dotsButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuId((prev) =>
                                            prev === file.id ? null : file.id
                                        );
                                    }}
                                    aria-label="File actions"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <circle className={styles.dotsBg} cx="12" cy="12" r="11.5" fill="#F0EEFE" stroke="#6C3ECC"/>
                                        <circle cx="11.7" cy="5.7002" r="1.5" fill="#6C3ECC"/>
                                        <circle cx="11.7" cy="11.7002" r="1.5" fill="#6C3ECC"/>
                                        <circle cx="11.7" cy="17.7002" r="1.5" fill="#6C3ECC"/>
                                    </svg>
                                </button>
                                {openMenuId === file.id && (
                                    <div className={styles.actionMenu} onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu
                                            items={[
                                                {
                                                    label: "Edit",
                                                    onClick: () => {
                                                        setOpenMenuId(null);
                                                        setEditTarget(file);
                                                    },
                                                },
                                                {
                                                    label: "Extract",
                                                    onClick: () => {
                                                        setOpenMenuId(null);
                                                        setExtractPrefetch(null);
                                                        setExtractTarget(file);
                                                    },
                                                },
                                                {
                                                    label: "Delete",
                                                    onClick: () => {
                                                        setOpenMenuId(null);
                                                        setDeleteTarget(file);
                                                    },
                                                },
                                            ]}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.name}>{file.name}</div>
                        <div className={styles.calendarName}>
                            {file.calendar?.title ?? "No calendar"}
                        </div>
                    </div>
                ))}
            </div>

            {showUpload && (
                <UploadFileModal
                    onUpload={handleUpload}
                    onClose={() => setShowUpload(false)}
                />
            )}

            {editTarget && (
                <EditFileModal
                    currentName={editTarget.name}
                    currentCalendarId={editTarget.calendarId}
                    onConfirm={(changes) => handleEdit(editTarget.id, changes)}
                    onClose={() => setEditTarget(null)}
                />
            )}

            {extractTarget && !extractPrefetch && (
                <ExtractPdfLoadingModal
                    fileId={extractTarget.id}
                    fileName={extractTarget.name}
                    onDone={(payload) => setExtractPrefetch(payload)}
                    onClose={() => setExtractTarget(null)}
                />
            )}
            {extractTarget && extractPrefetch && (
                <ExtractPdfModal
                    payload={extractPrefetch}
                    onClose={() => {
                        setExtractTarget(null);
                        setExtractPrefetch(null);
                    }}
                />
            )}

            {deleteTarget && (
                <DeleteFileModal
                    fileName={deleteTarget.name}
                    onConfirm={() => handleDelete(deleteTarget.id)}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}
