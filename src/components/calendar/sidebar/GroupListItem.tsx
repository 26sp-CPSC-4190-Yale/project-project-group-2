/**
 * A sidebar group item with a toggleable checkbox and group name.
 * Clicking the item toggles whether this group's events are shown.
 * @component
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./GroupListItem.module.css";
import { ActionMenu } from "@/components/ActionMenu";

export interface GroupListItemProps {
    groupName: string;
    selected?: boolean;
    onToggle?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isDefault?: boolean;
}

export function GroupListItem({
    groupName,
    selected = true,
    onToggle,
    onEdit,
    onDelete,
    isDefault = false,
}: GroupListItemProps) {
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
            className={styles.container}
            onClick={onToggle}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => {
                if (!menuOpen) setShowMenu(false);
            }}
        >
            <div className={`${styles.checkbox} ${selected ? styles.checked : ""}`}>
                {selected && <div className={styles.checkmark} />}
            </div>
            <span className={styles.text}>{groupName}</span>

            {!isDefault && (showMenu || menuOpen) && (
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
                        aria-label="Group actions"
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
