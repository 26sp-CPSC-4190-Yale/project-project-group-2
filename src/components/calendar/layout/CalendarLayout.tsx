/**
 * Layout for the app home page, where the calendar lives.
 * @component
 */

import styles from "./CalendarLayout.module.css";
import { Sidebar } from "./Sidebar";
import { CalendarViewLayout } from "../views/CalendarViewLayout";
import { Header } from "./Header";

interface CalendarLayoutProps {
    
}

export function CalendarLayout({

}: CalendarLayoutProps) {
    return (
        <div className={styles.container}>
            <Header/>
            <div className={styles.main}>
                <Sidebar/>
                <div className={styles.calendar}>
                    <CalendarViewLayout/>
                </div>
            </div>
        </div>
    );
}