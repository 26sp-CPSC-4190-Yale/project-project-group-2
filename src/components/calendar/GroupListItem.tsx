/**
 * A sidebar group item with a toggleable checkbox and group name.
 * Clicking the item toggles whether this group's events are shown.
 * @component
 */

import styles from "./GroupListItem.module.css";

export interface GroupListItemProps {
    groupName: string;
    selected?: boolean;
    onToggle?: () => void;
}

export function GroupListItem({
    groupName,
    selected = true,
    onToggle,
}: GroupListItemProps) {
    return (
        <div className={styles.container} onClick={onToggle}>
            <div className={`${styles.checkbox} ${selected ? styles.checked : ""}`}>
                {selected && <div className={styles.checkmark} />}
            </div>
            <span className={styles.text}>{groupName}</span>
        </div>
    );
}
