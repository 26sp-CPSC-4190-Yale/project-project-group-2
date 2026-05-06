/**
 * A dropdown selector with a dark purple bar and light text.
 * Clicking the chevron opens a menu of items below. Selecting
 * an item updates the displayed text in the bar.
 * @component
 */

"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./DropDownPrimary.module.css";

interface DropDownPrimaryProps {
    items: string[];
    defaultValue?: string;
    onChange?: (value: string) => void;
    width?: string;
}

export function DropDownPrimary({
    items,
    defaultValue,
    onChange,
    width = "4rem",
}: DropDownPrimaryProps) {
    const [selected, setSelected] = useState(defaultValue ?? items[0] ?? "");
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

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
        <div 
            className={styles.wrapper} 
            ref={wrapperRef} 
            style={{ width }}
            onClick={() => setOpen((prev) => !prev)}
        >
            <div className={styles.bar}>
                <span className={styles.barText}>{selected}</span>
                <img
                    src="/DropDownPrimaryChevron.png"
                    alt=""
                    className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
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
