/**
 * A critical component for the layout of the main page which functions as a collapsable sidebar. Contains items that go in the side bar.
 * @component
 */

"use client";

import { ChatInputBar } from "./ChatInputBar";
import styles from "./ChatSidebar.module.css";

interface ChatSidebarProps {
}

export function ChatSidebar({
}: ChatSidebarProps) {

    return (
        <>
            <div className={styles.introText}>
                I'll plan when you're ready.
            </div>
            <ChatInputBar
                placeholderText="Edit your calendar."
            />
        </>

    );
}
