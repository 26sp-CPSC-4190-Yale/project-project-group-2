/**
 * Generic button for OAuth, including image and service provider name.
 * @component
 */

"use client";

import styles from "./OAuthButton.module.css";

interface OAuthButtonProps {
    onClick?: () => void;
}

export function OAuthButton({
    onClick,
}: OAuthButtonProps) {
    const handleClick = onClick ?? (() => {
        window.location.href = "/api/auth/google";
    });

    return (
        <div
            className={styles.button}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") handleClick(); }}
        >
            <img src="/GoogleLogo.svg" alt="" className={styles.image}/>
            <div
                className={styles.text}
            >
                Login with Google
            </div>
        </div>
    );
}
