/**
 * Displays the user's Google profile image (or a fallback) with a
 * background-colored border ring. Clicking toggles an ActionMenu
 * dropdown with session actions.
 * @component
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./ProfileIcon.module.css";
import { ActionMenu } from "@/components/ActionMenu";

interface ProfileIconProps {
    avatarUrl?: string | null;
}

export function ProfileIcon({ avatarUrl }: ProfileIconProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <div
                className={styles.container}
                onClick={() => setMenuOpen((prev) => !prev)}
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="Profile"
                        className={styles.avatar}
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <span className={styles.fallback}>?</span>
                )}
            </div>
            {menuOpen && (
                <div className={styles.menuPosition}>
                    <ActionMenu
                        items={[
                            { label: "Logout", onClick: handleLogout },
                        ]}
                    />
                </div>
            )}
        </div>
    );
}
