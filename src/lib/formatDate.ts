export function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

export function formatItemDate(dateISO: string, endAtISO: string | null, allDay: boolean) {
    if (allDay) return formatDate(dateISO);
    const start = formatTime(dateISO);
    const date = formatDate(dateISO);
    if (endAtISO) return `${start} - ${formatTime(endAtISO)} · ${date}`;
    return `${start} · ${date}`;
}
