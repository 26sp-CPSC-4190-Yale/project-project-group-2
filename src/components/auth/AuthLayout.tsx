/**
 * Layout component for the authentication page.
 * @component
 */

import styles from "./AuthLayout.module.css";
import { Logo } from "@/components/Logo";
import { OAuthButton } from "./OAuthButton";

interface AuthLayoutProps {

}

export function AuthLayout({

}: AuthLayoutProps) {
    return (
        <div className={styles.container}>
            <div className={styles.logoposition}>
                <Logo />
            </div>
            <div className={styles.sloganposition}>
                <div className={styles.slogan}>
                    Slogan on planning,<br/>efficiency, blah blah.
                </div>
            </div>
            <div className={styles.oauthposition}>
                <OAuthButton />
            </div>
        </div>
    );
}