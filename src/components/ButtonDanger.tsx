/**
 * @component
 */

import styles from "./ButtonDanger.module.css";

interface ButtonDangerProps {
    label: string;
    onClick?: () => void;
    width?: string;
}

export function ButtonDanger({
    label,
    onClick,
    width,
}: ButtonDangerProps) {
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
