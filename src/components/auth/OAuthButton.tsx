/**
 * Generic button for OAuth, including image and service provider name.
 * @component
 */

import styles from "./OAuthButton.module.css";

interface OAuthButtonProps {
    onClick?: () => void;
}

export function OAuthButton({
    onClick,
}: OAuthButtonProps) {
    return (
        <div
            className={styles.button}
            onClick={onClick}
        >
            <div 
                className={styles.text}
            >
                Login with Google
            </div>
        </div>
    );
}