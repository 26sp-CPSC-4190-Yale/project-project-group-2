/**
 * A sidebar task item with a toggleable checkbox and task name.
 * Clicking anywhere on the item toggles the checkbox.
 * @component
 */

import styles from "./TaskListItem.module.css";

export interface TaskListItemProps {
    taskName: string;
    checked?: boolean;
    onToggle?: () => void;
    isDueSoon?: boolean; 
}

export function TaskListItem({
    taskName,
    checked = false,
    onToggle,
    isDueSoon, 
}: TaskListItemProps) {
    return (
        <div
            className={`${styles.container} ${isDueSoon ? styles.dueSoon : ""}`}
            onClick={onToggle}
        >
            <div className={`${styles.checkbox} ${checked ? styles.checked : ""}`}>
                {checked && <div className={styles.checkmark} />}
            </div>
            <span className={styles.text}>{taskName}</span>
        </div>
    );
}
