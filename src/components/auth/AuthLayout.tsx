/**
 * Layout component for the authentication page.
 * @component
 */

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