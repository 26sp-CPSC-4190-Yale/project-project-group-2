/**
 * A dropdown selector with a light purple bar and dark text.
 * Clicking the chevron opens a menu of items below. Selecting
 * an item updates the displayed text in the bar.
 * @component
 */

"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./DropDownSecondary.module.css";

interface DropDownSecondaryProps {
    items: string[];
    defaultValue?: string;
    onChange?: (value: string) => void;
    width?: string;
}

export function DropDownSecondary({
    items,
    defaultValue,
    onChange,
    width = "4rem",
}: DropDownSecondaryProps) {
    const [selected, setSelected] = useState(defaultValue ?? items[0] ?? "");
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (defaultValue !== undefined && defaultValue !== selected) {
            setSelected(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item: string) => {
        setSelected(item);
        onChange?.(item);
        setOpen(false);
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef} style={{ width }}>
            <div className={styles.bar}>
                <span className={styles.barText}>{selected}</span>
                <img
                    src="/DropDownSecondaryChevron.png"
                    alt=""
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                    onClick={() => setOpen((prev) => !prev)}
                />
            </div>
            {open && (
                <div className={styles.menu}>
                    {items.map((item) => (
                        <div
                            key={item}
                            className={styles.menuItem}
                            onClick={() => handleSelect(item)}
                        >
                            {item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
