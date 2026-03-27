/**
 * A critical component for the layout of the main page. Contain items that go in the header.
 * @component
 */

import { ProfileIcon } from "./ProfileIcon";
import styles from "./Header.module.css";
interface HeaderProps {
    
}

export function Header({

}: HeaderProps) {
    return (
        <div className={styles.header}>
            <div className={styles.profileWrapper}>
                <ProfileIcon/>
            </div>    
        </div>
    );
}