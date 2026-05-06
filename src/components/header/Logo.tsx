/**
 * A basic component to put the logo in (which is currently just text).
 * @component
 */

import styles from "./Logo.module.css";

interface LogoProps {
    
}

export function Logo({

}: LogoProps) {
    return (
        <div className={styles.container}
        >
            <a href="/">
                Planar
            </a>
        </div>
    );
}