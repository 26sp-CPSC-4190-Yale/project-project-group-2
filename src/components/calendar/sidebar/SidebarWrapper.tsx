/**
 * A critical component for the layout of the main page which functions as a collapsable sidebar. Contains items that go in the side bar.
 * @component
 */

import styles from "./SidebarWrapper.module.css";

interface SidebarWrapperProps {
    children?: React.ReactNode;
}

export function SidebarWrapper({
    children,
}: SidebarWrapperProps) {

    return (
        <div className={styles.container}>
            {children}
        </div>
    );
}
