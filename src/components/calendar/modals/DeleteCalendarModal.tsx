"use client";

import styles from "./DeleteCalendarModal.module.css";
import { ButtonSecondary } from "@/components/ButtonSecondary";
import { ButtonDanger } from "@/components/ButtonDanger";

interface DeleteCalendarModalProps {
    calendarTitle: string;
    onConfirm: () => void;
    onClose: () => void;
}

export function DeleteCalendarModal({
    calendarTitle,
    onConfirm,
    onClose,
}: DeleteCalendarModalProps) {
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>Delete Calendar</h2>
                <p className={styles.message}>
                    Are you sure you want to delete{" "}
                    <span className={styles.itemName}>{calendarTitle}</span>? This
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
