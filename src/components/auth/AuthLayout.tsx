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
        <div>
            <Logo />
            <OAuthButton />
        </div>
    );
}