// JSON Schemas + matching TypeScript interfaces for strict Structured Outputs of AI responses.

// Chat Reponses API: function-tool argument schemas (Responses API)

export interface ProposedEventArgs {
    name: string;
    startAtISO: string;
    endAtISO: string | null;
    allDay: boolean;
    calendarId: string;
    groupId: string | null;
    description: string | null;
    location: string | null;
    link: string | null;
    remindBeforeMinutes: number | null;
  }
  
  export const proposedEventSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      name:                { type: "string", description: "event name" },
      startAtISO:          { type: "string", description: "ISO 8601 datetime in the user's timezone" },
      endAtISO:            { type: ["string", "null"] },
      allDay:              { type: "boolean" },
      calendarId:          { type: "string", description: "ID listed in the system prompt" },
      groupId:             { type: ["string", "null"], description: "Null means use the calendar's default group" },
      description:         { type: ["string", "null"] },
      location:            { type: ["string", "null"] },
      link:                { type: ["string", "null"] },
      remindBeforeMinutes: { type: ["integer", "null"] },
    },
    required: [
      "name", "startAtISO", "endAtISO", "allDay",
      "calendarId", "groupId", "description",
      "location", "link", "remindBeforeMinutes",
    ],
  } as const;
  
  export interface ProposedTaskArgs {
    name: string;
    dueAtISO: string;
    allDay: boolean;
    calendarId: string;
    groupId: string | null;
    notes: string | null;
    location: string | null;
    link: string | null;
    remindBeforeMinutes: number | null;
  }
  
  export const proposedTaskSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      name:                { type: "string" },
      dueAtISO:            { type: "string" },
      allDay:              { type: "boolean" },
      calendarId:          { type: "string" },
      groupId:             { type: ["string", "null"] },
      notes:               { type: ["string", "null"] },
      location:            { type: ["string", "null"] },
      link:                { type: ["string", "null"] },
      remindBeforeMinutes: { type: ["integer", "null"] },
    },
    required: [
      "name", "dueAtISO", "allDay", "calendarId",
      "groupId", "notes", "location", "link", "remindBeforeMinutes",
    ],
  } as const;
  
  export interface AskClarificationArgs {
    question: string;
  }
  
  export const askClarificationSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      question: { type: "string" },
    },
    required: ["question"],
  } as const;
  
  // PDF extraction API: response_format json_schema
  
  export interface ExtractedItem {
    kind: "event" | "task";
    name: string;
    /** Start datetime for events, due datetime for tasks. ISO 8601. */
    dateISO: string;
    /** null for tasks or single-day events. */
    endAtISO: string | null;
    allDay: boolean;
    notes: string | null;
    location: string | null;
    /** self-reported confidence. Low-confidence items get flagged in the UI. */
    confidence: number;
  }
  
  export interface ExtractionResult {
    items: ExtractedItem[];
    detectedTimezone: string | null;
    unparseableNotes: string | null;
  }
  
  export const extractionSchema = {
    type: "object",
    additionalProperties: false,
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            kind:       { type: "string", enum: ["event", "task"] },
            name:       { type: "string" },
            dateISO:    { type: "string" },
            endAtISO:   { type: ["string", "null"] },
            allDay:     { type: "boolean" },
            notes:      { type: ["string", "null"] },
            location:   { type: ["string", "null"] },
            confidence: { type: "number" },
          },
          required: [
            "kind", "name", "dateISO", "endAtISO",
            "allDay", "notes", "location", "confidence",
          ],
        },
      },
      detectedTimezone: { type: ["string", "null"] },
      unparseableNotes: { type: ["string", "null"] },
    },
    required: ["items", "detectedTimezone", "unparseableNotes"],
  } as const;