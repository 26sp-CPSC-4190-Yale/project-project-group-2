/**
 * Nearly identical to the CalendarListItem, however user interaction with this component causes the menu to create a calendar to display. Has a hover effect.
 * @component
 */

import styles from "./CreateListItemButton.module.css";

interface CreateListItemButtonProps {
   onClick?: () => void; 
}

export function CreateListItemButton({
    onClick,
}: CreateListItemButtonProps) {
    return (
        <div 
            className={styles.container}
            onClick={onClick}
        >
           <div className={styles.text}>
                +
            </div> 
        </div>
    );
}