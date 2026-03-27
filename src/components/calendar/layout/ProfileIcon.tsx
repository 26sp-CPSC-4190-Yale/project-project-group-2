/**
 * Component used to display the users profile image (or monogram if they do not have an image). Should be interactable and spawn ActionMenu component to allow user to sign out.
 * @component
 */

import styles from "./ProfileIcon.module.css";
import { ActionMenu } from "@/components/ActionMenu";

interface ProfileIconProps {
    onClick?: ()=>void;
}

export function ProfileIcon({
    onClick,
}: ProfileIconProps) {
    return (
        <div
            onClick={onClick}
            className={styles.container}
        >
            
        </div>
    );
}