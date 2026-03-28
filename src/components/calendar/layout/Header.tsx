/**
 * A critical component for the layout of the main page. Contain items that go in the header.
 * @component
 */

import { ProfileIcon } from "./ProfileIcon";
import styles from "./Header.module.css";
import { Logo } from "@/components/Logo";

interface HeaderProps {
    avatarUrl?: string | null;
}

export function Header({
    avatarUrl,
}: HeaderProps) {
    return (
        <div className={styles.header}>
            <div className={styles.logoWrapper}>
                <Logo/>
            </div>
            <div className={styles.profileWrapper}>
                <ProfileIcon avatarUrl={avatarUrl} />
            </div>    
        </div>
    );
}
