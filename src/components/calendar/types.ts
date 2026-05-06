export interface CalendarEvent {
    id: string;
    name: string;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    link: string | null;
    description: string | null;
    notes: string | null;
    location: string | null;
    remindBefore: number | null;
    groupId: string;
    calendarId: string;
    color?: string;
    isShared?: boolean;
}
