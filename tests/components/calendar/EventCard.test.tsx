import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventCard } from "@/components/calendar/EventCard";
import type { CalendarEvent } from "@/components/calendar/types";

const baseEvent: CalendarEvent = {
  id: "e1",
  name: "Standup",
  startAt: "2026-06-15T09:00:00.000Z",
  endAt: "2026-06-15T09:30:00.000Z",
  allDay: false,
  link: null,
  description: null,
  notes: null,
  location: null,
  remindBefore: null,
  calendarId: "c1",
};

describe("<EventCard />", () => {
  it("renders the compact chip with the event name", () => {
    render(<EventCard event={baseEvent} compact />);
    expect(screen.getByText("Standup")).toBeInTheDocument();
  });

  it("renders the full bar with a formatted time when not all-day", () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText("Standup")).toBeInTheDocument();
    // The time is formatted with AM/PM; don't assert the exact zone-dependent hour.
    expect(screen.getByText(/AM|PM/)).toBeInTheDocument();
  });

  it("omits the time label for all-day events", () => {
    render(<EventCard event={{ ...baseEvent, allDay: true }} />);
    expect(screen.getByText("Standup")).toBeInTheDocument();
    expect(screen.queryByText(/AM|PM/)).not.toBeInTheDocument();
  });

  it("fires onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<EventCard event={baseEvent} onClick={onClick} />);
    await user.click(screen.getByText("Standup"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
