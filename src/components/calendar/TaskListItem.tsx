/**
 * A sidebar task item with a toggleable checkbox and task name.
 * Clicking anywhere on the item toggles the checkbox.
 * @component
 */

import styles from "./TaskListItem.module.css";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ActionMenu } from "@/components/ActionMenu";

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
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const menuRef = useRef<HTMLDivElement | null>(null);
    const portalRef = useRef<HTMLDivElement | null>(null);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const openMenu = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        }
        setMenuOpen(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (
                menuRef.current && !menuRef.current.contains(target) &&
                portalRef.current && !portalRef.current.contains(target)
            ) {
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
                    <button
                        ref={buttonRef}
                        className={styles.dotsButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (menuOpen) {
                                setMenuOpen(false);
                            } else {
                                openMenu();
                            }
                        }}
                        aria-label="Task actions"
                    >
                        ···
                    </button>

                    {menuOpen && createPortal(
                        <div
                            ref={portalRef}
                            style={{
                                position: "fixed",
                                top: menuPos.top,
                                right: menuPos.right,
                                zIndex: 9999,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ActionMenu
                                items={[
                                    {
                                        label: "Edit",
                                        onClick: () => {
                                            setMenuOpen(false);
                                            onEdit?.();
                                        },
                                    },
                                    {
                                        label: "Delete",
                                        onClick: () => {
                                            setMenuOpen(false);
                                            onDelete?.();
                                        },
                                    },
                                ]}
                            />
                        </div>,
                        document.body,
                    )}
                </div>
            )}
        </div>
    );
}
