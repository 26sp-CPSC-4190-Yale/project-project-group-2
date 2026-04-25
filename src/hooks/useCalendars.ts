"use client";

import { useEffect, useState } from "react";

export interface CalendarOption {
    id: string;
    title: string;
}

export function useCalendars() {
    const [calendars, setCalendars] = useState<CalendarOption[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/calendars")
            .then((res) => res.json())
            .then((json) => {
                if (cancelled) return;
                setCalendars(json.data ?? json);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return { calendars, loading };
}
