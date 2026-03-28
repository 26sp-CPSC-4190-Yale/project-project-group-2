/**
 * Button to open the event creation menu. Displays "Add Event" with a "+"
 * icon. Matches the height of the DropDownPrimary in the button row.
 * @component
 */

import styles from "./AddNewButton.module.css";

interface AddNewButtonProps {
    onClick?: () => void;
}

export function AddNewButton({ onClick }: AddNewButtonProps) {
    return (
        <div className={styles.container} onClick={onClick}>
            <span className={styles.text}>Add Event</span>
            <span className={styles.plus}>+</span>
        </div>
    );
}
