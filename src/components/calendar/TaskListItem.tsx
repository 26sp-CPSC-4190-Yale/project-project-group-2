/**
 * A sidebar task item with a toggleable checkbox and task name.
 * Clicking anywhere on the item toggles the checkbox.
 * @component
 */

import styles from "./TaskListItem.module.css";
import { useState, useRef, useEffect } from "react";
export interface TaskListItemProps {
    taskName: string;
    checked?: boolean;
    onToggle?: () => void;

    onEdit?: () => void; 
    onDelete?: () => void;
    isDueSoon?: boolean;
}


export function TaskListItem({
    taskName,
    checked = false,
    onToggle,
    onEdit,
    onDelete,
    isDueSoon, 
}: TaskListItemProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div
            className={`${styles.container} ${isDueSoon ? styles.dueSoon : ""}`}
            onClick={onToggle}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => {
                if (!menuOpen) setShowMenu(false);
            }}
        >
            <div className={`${styles.checkbox} ${checked ? styles.checked : ""}`}>
                {checked && <div className={styles.checkmark} />}
            </div>

            <span className={styles.text}>{taskName}</span>

            {(showMenu || menuOpen) && (
                <div
                    className={styles.menuWrapper}
                    ref={menuRef}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className={styles.menuButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen((prev) => !prev);
                        }}
                    >
                        ⋯
                    </div>

                    {menuOpen && (
                        <div className={styles.dropdown}>
                            <div
                                onClick={() => {
                                    setMenuOpen(false);
                                    onEdit?.();
                                }}
                            >
                                Edit
                            </div>
                            <div
                                className={styles.delete}
                                onClick={() => {
                                    setMenuOpen(false);
                                    onDelete?.();
                                }}
                            >
                                Delete
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
