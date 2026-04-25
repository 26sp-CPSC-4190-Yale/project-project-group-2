"use client";

import { useState } from "react";
import styles from "./RenameFileModal.module.css";
import { ButtonPrimary } from "@/components/ButtonPrimary";
import { ButtonSecondary } from "@/components/ButtonSecondary";

interface RenameFileModalProps {
    currentName: string;
    onConfirm: (newName: string) => void;
    onClose: () => void;
}

export function RenameFileModal({
    currentName,
    onConfirm,
    onClose,
}: RenameFileModalProps) {
    const [name, setName] = useState(currentName);

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.card} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.heading}>Rename File</h2>

                <label className={styles.label}>Name</label>
                <input
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && name.trim()) onConfirm(name.trim());
                    }}
                />

                <div className={styles.actions}>
                    <ButtonSecondary label="Cancel" onClick={onClose} />
                    <ButtonPrimary
                        label="Save"
                        onClick={() => {
                            if (name.trim()) onConfirm(name.trim());
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
