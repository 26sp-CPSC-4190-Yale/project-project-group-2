import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { EventCardEditMenu } from "@/components/calendar/EventCardEditMenu";
import type { CalendarEvent } from "@/components/calendar/types";
import { server } from "../../msw/server";

const event: CalendarEvent = {
  id: "e1",
  name: "Interview",
  startAt: "2026-06-15T09:00:00.000Z",
  endAt: null,
  allDay: true,
  link: null,
  description: null,
  notes: null,
  location: null,
  remindBefore: null,
  calendarId: "c1",
};

describe("<EventCardEditMenu />", () => {
  it("renders a read-only view when readOnly is true (shared event)", () => {
    render(<EventCardEditMenu event={event} readOnly onClose={() => {}} />);
    expect(screen.getByText(/Shared Event/i)).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
    // No "Save" or "Delete" buttons in read-only mode.
    expect(screen.queryByText(/^Save$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Delete$/)).not.toBeInTheDocument();
  });

  it("PATCHes the event when Save is clicked", async () => {
    let body: Record<string, unknown> | null = null;
    server.use(
      http.patch("*/api/events/e1", async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ data: { id: "e1" } });
      }),
    );

    const user = userEvent.setup();
    render(<EventCardEditMenu event={event} onClose={() => {}} />);

    const nameInput = screen.getAllByRole("textbox")[0];
    await user.clear(nameInput);
    await user.type(nameInput, "Renamed Event");

    await user.click(screen.getByText(/^Save$/));

    await waitFor(() => expect(body).not.toBeNull());
    expect(body).toMatchObject({ name: "Renamed Event" });
  });

  it("DELETEs the event when Delete is clicked", async () => {
    let deleted = false;
    server.use(
      http.delete("*/api/events/e1", () => {
        deleted = true;
        return HttpResponse.json({ data: { message: "Event deleted" } });
      }),
    );

    const user = userEvent.setup();
    render(<EventCardEditMenu event={event} onClose={() => {}} />);

    await user.click(screen.getByText(/^Delete$/));

    await waitFor(() => expect(deleted).toBe(true));
  });
});
