// =============================================================================
// Generic API Types
// =============================================================================

export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// =============================================================================
// Route Parameter Helpers
// =============================================================================

/** Context object for route handlers with a dynamic `[id]` segment. */
export type IdRouteContext = {
  params: Promise<{ id: string }>;
};

// =============================================================================
// Entity Response Types
// =============================================================================

export interface UserResponse {
  id: string;
  googleId: string | null;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarResponse {
  id: string;
  title: string;
  color: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  groups?: GroupResponse[];
}

export interface GroupResponse {
  id: string;
  name: string;
  notes: string | null;
  color: string;
  calendarId: string;
  createdAt: Date;
  updatedAt: Date;
  events?: EventResponse[];
  tasks?: TaskResponse[];
}

export interface EventResponse {
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
  isShared?: boolean;
  createdAt: string;
  updatedAt: string;
  tasks?: TaskResponse[];
  group?: GroupResponse;
}

export interface InvitationResponse {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  eventId: string;
  senderId: string;
  recipientId: string;
  createdAt: string;
  updatedAt: string;
  event?: EventResponse;
  sender?: Pick<UserResponse, "id" | "name" | "email" | "avatarUrl">;
  recipient?: Pick<UserResponse, "id" | "name" | "email" | "avatarUrl">;
}

export interface TaskResponse {
  id: string;
  name: string;
  dueAt: string;
  allDay: boolean;
  completed: boolean;
  notes: string | null;
  remindBefore: number | null;
  link: string | null;
  location: string | null;
  userId: string;
  groupId: string;
  eventId: string | null;
  createdAt: string;
  updatedAt: string;
  group?: GroupResponse;
  event?: EventResponse | null;
}

// =============================================================================
// Create Request Body Types
//
// Sent as JSON in POST requests. Optional fields have '?' next to them.
// Optional fields either have schema defaults or are nullable columns.
// =============================================================================

export interface CreateCalendarBody {
  title?: string;
  color?: string;
  description?: string;
}

export interface CreateGroupBody {
  calendarId: string;
  name?: string;
  notes?: string;
  color?: string;
}

export interface CreateEventBody {
  calendarId: string;
  name?: string;
  startAt: string;
  endAt?: string;
  allDay?: boolean;
  link?: string;
  description?: string;
  notes?: string;
  location?: string;
  remindBefore?: number;
  groupId?: string;
}

export interface CreateTaskBody {
  name: string;
  dueAt: string;
  allDay?: boolean;
  notes?: string;
  remindBefore?: number;
  link?: string;
  location?: string;
  calendarId?: string;
  groupId?: string;
  eventId?: string;
}

export interface CreateInvitationBody {
  eventId: string;
  recipientEmail: string;
}

// =============================================================================
// Update Request Body Types
//
// Sent as JSON in PATCH requests. Every field is optional — omitted fields
// remain unchanged. Fields that accept `null` can be explicitly cleared.
// =============================================================================

export interface UpdateCalendarBody {
  title?: string;
  color?: string;
  description?: string | null;
}

export interface UpdateGroupBody {
  name?: string;
  notes?: string | null;
  color?: string;
}

export interface UpdateEventBody {
  name?: string;
  startAt?: string;
  endAt?: string | null;
  allDay?: boolean;
  link?: string | null;
  description?: string | null;
  notes?: string | null;
  location?: string | null;
  remindBefore?: number | null;
  groupId?: string | null;
}

export interface UpdateTaskBody {
  name?: string;
  dueAt?: string;
  allDay?: boolean;
  completed?: boolean;
  notes?: string | null;
  remindBefore?: number | null;
  link?: string | null;
  location?: string | null;
  groupId?: string | null;
  eventId?: string | null;
}

export interface UpdateInvitationBody {
  status: "ACCEPTED" | "DECLINED";
}

// =============================================================================
// Query Parameter Types
//
// Used by GET list endpoints for filtering. All values arrive as strings from
// URL search params and need to be parsed/validated in the handler.
// =============================================================================

export interface GroupQueryParams {
  calendarId?: string;
}

export interface EventQueryParams {
  calendarId?: string;
  groupId?: string;
  start?: string;
  end?: string;
}

export interface TaskQueryParams {
  calendarId?: string;
  groupId?: string;
  eventId?: string;
  /** "true" | "false" */
  completed?: string;
  start?: string;
  end?: string;
}

export interface InvitationQueryParams {
  /** "sent" | "received" */
  type?: string;
  /** "PENDING" | "ACCEPTED" | "DECLINED" */
  status?: string;
}

/** Query params for GET /api/calendars/[id] */
export interface CalendarGetParams {
  /** Comma-separated relation includes: "groups", "events", "groups,events" */
  include?: string;
}

/** Query params for GET /api/events/[id] */
export interface EventGetParams {
  /** Comma-separated relation includes: "tasks" */
  include?: string;
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiPageContext {
  page: "calendar" | "files";
  selectedCalendarId: string | null;
  selectedGroupIds: string[];
  /** ISO 8601, client-side `new Date().toISOString()`. */
  currentDateISO: string;
  /** IANA zone, e.g. "America/New_York". `Intl.DateTimeFormat().resolvedOptions().timeZone`. */
  timezone: string;
}

export interface AiChatRequestBody {
  messages: AiChatMessage[];
  context: AiPageContext;
}

/** Unified assistant response envelope. `proposal.data` is a validated server-side payload ready for the corresponding existing endpoint. */
export type AiChatResponseBody =
  | { kind: "text"; text: string }
  | { kind: "question"; text: string }
  | { kind: "proposal"; proposalKind: "event"; data: CreateEventBody & { displayCalendarTitle: string; displayGroupName: string } }
  | { kind: "proposal"; proposalKind: "task"; data: CreateTaskBody & { displayCalendarTitle: string; displayGroupName: string } }
  | { kind: "error"; message: string };

// =============================================================================
// PDF Extraction Types
// =============================================================================

import type { ExtractedItem } from "@/lib/aiSchemas";

export interface ExtractPdfPrefetchPayload {
  extract: {
    items: ExtractedItem[];
    defaultCalendarId: string | null;
    defaultGroupId: string | null;
    detectedTimezone: string | null;
    unparseableNotes: string | null;
  };
  calendars: Array<{ id: string; title: string }>;
}