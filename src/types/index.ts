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
  createdAt: string;
  updatedAt: string;
  tasks?: TaskResponse[];
  group?: GroupResponse;
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
