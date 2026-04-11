/**
 * A general template for an item representing a calendar in the sidebar.
 * Has a hover effect. Clicking selects this calendar as the active one.
 * @component
 */

import { useState, useRef, useEffect } from "react";
import styles from "./CalendarListItem.module.css";

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
    const [menuDirection, setMenuDirection] = useState<"up" | "down">("down");
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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
            onMouseEnter={() => {
                setShowMenu(true);

                if (menuRef.current) {
                    const rect = menuRef.current.getBoundingClientRect();
                    const spaceBelow = window.innerHeight - rect.bottom;

                    if (spaceBelow < 150) {
                        setMenuDirection("up");
                    } else {
                        setMenuDirection("down");
                    }
                }
            }}
            onMouseLeave={() => {
                if (!menuOpen) {
                    setShowMenu(false);
                }
            }}
        >
            <div className={`${styles.text} ${active ? styles.activeText : styles.inactiveText}`}>
                {calendarName}
            </div>

            <div className={styles.menuWrapper} ref={menuRef}>
                <button
                    className={`${styles.dotsButton} ${active ? styles.dotsActive : styles.dotsInactive}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen((prev) => !prev);
                    }}
                    aria-label="Calendar actions"
                >
                    ···
                </button>

                {menuOpen && (
                    <div
                        className={`${styles.dropdown} ${
                            menuDirection === "up" ? styles.up : styles.down
                        }`}
                    >
                        {!isDefault && (
                            <>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpen(false);
                                        onEdit?.();
                                    }}
                                >
                                    Edit
                                </div>

                                <div
                                    className={styles.delete}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMenuOpen(false);
                                        onDelete?.();
                                    }}
                                >
                                    Delete
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
