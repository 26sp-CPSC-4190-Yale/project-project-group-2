/**
 * A generic dropdown menu with a configurable list of action items.
 * Each item has a label and an onClick handler.
 * @component
 */

import styles from "./ActionMenu.module.css";

export interface ActionMenuItem {
    label: string;
    onClick: () => void;
}

interface ActionMenuProps {
    items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
    return (
        <div className={styles.menu}>
            {items.map((item, i) => (
                <div
                    key={i}
                    className={styles.item}
                    onClick={item.onClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") item.onClick(); }}
                >
                    {item.label}
                </div>
            ))}
        </div>
    );
}
