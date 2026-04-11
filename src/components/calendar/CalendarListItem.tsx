/**
 * A general template for an item representing a calendar in the sidebar.
 * Has a hover effect. Clicking selects this calendar as the active one.
 * @component
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./CalendarListItem.module.css";
import { ActionMenu } from "@/components/ActionMenu";

interface CalendarListItemProps {
    calendarName?: string;
    active?: boolean;
    onClick?: () => void;

    onEdit?: () => void;
    onDelete?: () => void;
    isDefault?: boolean;
}

export function CalendarListItem({
    calendarName,
    active = false,
    onClick,
    onEdit,
    onDelete,
    isDefault,
}: CalendarListItemProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
    const menuRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const openMenu = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        }
        setMenuOpen(true);
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
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
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen]);

    return (
        <div
            className={`${styles.container} ${active ? styles.active : styles.inactive}`}
            onClick={onClick}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => {
                if (!menuOpen) {
                    setShowMenu(false);
                }
            }}
        >
            <div className={`${styles.text} ${active ? styles.activeText : styles.inactiveText}`}>
                {calendarName}
            </div>

            {!isDefault && showMenu && (
                <div className={styles.menuWrapper} ref={menuRef}>
                    <button
                        ref={buttonRef}
                        className={`${styles.dotsButton} ${
                            active ? styles.dotsActive : styles.dotsInactive
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (menuOpen) {
                                setMenuOpen(false);
                            } else {
                                openMenu();
                            }
                        }}
                        aria-label="Calendar actions"
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
