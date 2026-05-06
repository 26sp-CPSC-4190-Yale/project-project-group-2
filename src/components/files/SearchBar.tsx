/**
 * @component
 */

import styles from "./SearchBar.module.css";

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    width?: string;
}

export function SearchBar({
    placeholder = "Search...",
    value,
    onChange,
    width,
}: SearchBarProps) {
    return (
        <div
            className={styles.searchBar}
            style={width ? { width } : undefined}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A697C5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                className={styles.input}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </div>
    );
}
