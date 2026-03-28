/**
 * A general template for an item representing a calendar in the sidebar.
 * Has a hover effect. Clicking selects this calendar as the active one.
 * @component
 */

import styles from "./CalendarListItem.module.css";

interface CalendarListItemProps {
    calendarName?: string;
    active?: boolean;
    onClick?: () => void;
}

export function CalendarListItem({
    calendarName,
    active = false,
    onClick,
}: CalendarListItemProps) {
    return (
        <div
            className={`${styles.container} ${active ? styles.active : styles.inactive}`}
            onClick={onClick}
        >
            <div className={`${styles.text} ${active ? styles.activeText : styles.inactiveText}`}>
                {calendarName}
            </div>
        </div>
    );
}
