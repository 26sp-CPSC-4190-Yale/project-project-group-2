/**
 * A secondary action button with light purple background and dark text.
 * Matches DropDownSecondary colors without the chevron or dropdown.
 * @component
 */

import styles from "./ButtonSecondary.module.css";

interface ButtonSecondaryProps {
    label: string;
    onClick?: () => void;
    width?: string;
}

export function ButtonSecondary({
    label,
    onClick,
    width,
}: ButtonSecondaryProps) {
    return (
        <div
            className={styles.button}
            style={width ? { width } : undefined}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") onClick?.(); }}
        >
            <span className={styles.text}>{label}</span>
        </div>
    );
}
