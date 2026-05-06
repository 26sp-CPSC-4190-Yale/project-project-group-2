/**
 * Small "New chat" button shown above the chat message box once a thread
 * exists. Click clears the thread.
 * @component
 */

"use client";

import styles from "./NewChatButton.module.css";

interface NewChatButtonProps {
    onClick: () => void;
}

export function NewChatButton({ onClick }: NewChatButtonProps) {
    return (
        <button type="button" className={styles.button} onClick={onClick}>
            <span>New chat</span>
        </button>
    );
}
