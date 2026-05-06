/**
 * A primary action button with dark purple background and light text.
 * Matches DropDownPrimary colors without the chevron or dropdown.
 * @component
 */

import styles from "./ButtonPrimary.module.css";

interface ButtonPrimaryProps {
    label: string;
    onClick?: () => void;
    width?: string;
}

export function ButtonPrimary({
    label,
    onClick,
    width,
}: ButtonPrimaryProps) {
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
