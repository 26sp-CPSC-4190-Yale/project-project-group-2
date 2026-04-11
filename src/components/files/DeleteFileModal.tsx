"use client";

import styles from "./DeleteFileModal.module.css";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { ButtonDanger } from "@/components/ButtonDanger";

interface DeleteFileModalProps {
    fileName: string;
    onConfirm: () => void;
    onClose: () => void;
}

export function DeleteFileModal({
    fileName,
    onConfirm,
    onClose,
}: DeleteFileModalProps) {
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>Delete File</h2>
                <p className={styles.message}>
                    Are you sure you want to delete{" "}
                    <span className={styles.fileName}>{fileName}</span>? This
                    action cannot be undone.
                </p>
                <div className={styles.actions}>
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonDanger label="Delete" onClick={onConfirm} />
                </div>
            </div>
        </div>
    );
}
