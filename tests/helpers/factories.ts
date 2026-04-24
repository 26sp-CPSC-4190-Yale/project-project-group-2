/**
 * Typed factories for building fake Prisma records in tests.
 * Keep these loose (partial overrides) so individual tests can focus on
 * only the fields they care about.
 */

const baseDate = new Date("2026-01-01T00:00:00.000Z");

export function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "user-1",
    googleId: "google-1",
    email: "user1@example.com",
    password: null,
    name: "User One",
    avatarUrl: null,
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };
}

export function makeCalendar(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "cal-1",
    title: "My Calendar",
    color: "none",
    description: null,
    userId: "user-1",
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };
}

export function makeGroup(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "group-1",
    name: "Default Group",
    notes: null,
    color: "none",
    isDefault: true,
    calendarId: "cal-1",
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };
}

export function makeEvent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "event-1",
    name: "Event 1",
    startAt: new Date("2026-01-15T10:00:00.000Z"),
    endAt: new Date("2026-01-15T11:00:00.000Z"),
    allDay: false,
    link: null,
    description: null,
    notes: null,
    location: null,
    remindBefore: null,
    groupId: "group-1",
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };
}

export function makeTask(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "task-1",
    name: "Task 1",
    dueAt: new Date("2026-01-15T10:00:00.000Z"),
    allDay: true,
    completed: false,
    notes: null,
    remindBefore: null,
    link: null,
    location: null,
    userId: "user-1",
    groupId: "group-1",
    eventId: null,
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };
}

export function makeInvitation(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "inv-1",
    status: "PENDING" as const,
    eventId: "event-1",
    senderId: "user-1",
    recipientId: "user-2",
    createdAt: baseDate,
    updatedAt: baseDate,
    ...overrides,
  };
}

export function makeSharedEvent(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "shared-1",
    eventId: "event-1",
    userId: "user-2",
    groupId: "group-2",
    createdAt: baseDate,
    ...overrides,
  };
}

export function makeUploadedFile(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "file-1",
    name: "doc.pdf",
    storagePath: "user-1/1234_doc.pdf",
    userId: "user-1",
    calendarId: null,
    createdAt: baseDate,
    ...overrides,
  };
}
