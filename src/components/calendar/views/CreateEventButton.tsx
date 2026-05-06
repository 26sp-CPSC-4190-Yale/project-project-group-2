/**
 * Button to open the event creation menu. Displays "Add Event" with a "+"
 * icon. Matches the height of the DropDownPrimary in the button row.
 * @component
 */

import styles from "./CreateEventButton.module.css";

interface CreateEventButtonProps {
    onClick?: () => void;
}

export function CreateEventButton({ onClick }: CreateEventButtonProps) {
    return (
        <div className={styles.container} onClick={onClick}>
            <span className={styles.text}>Add Event</span>
            <span className={styles.plus}>+</span>
        </div>
    );
}
