/**
 * @component
 */

"use client";

import styles from "./DeleteGroupModal.module.css";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { ButtonDanger } from "@/components/ButtonDanger";

interface DeleteGroupModalProps {
    groupName: string;
    onConfirm: () => void;
    onClose: () => void;
}

export function DeleteGroupModal({
    groupName,
    onConfirm,
    onClose,
}: DeleteGroupModalProps) {
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>Delete Group</h2>
                <p className={styles.message}>
                    Are you sure you want to delete{" "}
                    <span className={styles.itemName}>{groupName}</span>? This
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
