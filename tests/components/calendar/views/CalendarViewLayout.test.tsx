import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { CalendarViewLayout } from "@/components/calendar/views/CalendarViewLayout";
import { server } from "../../../msw/server";

describe("<CalendarViewLayout />", () => {
  it("fetches events for the selected calendar + group", async () => {
    let requestedUrl = "";
    server.use(
      http.get("*/api/events", ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({ data: [] });
      }),
    );

    render(
      <CalendarViewLayout selectedCalendarId="c1" selectedGroupIds={["g1", "g2"]} />,
    );

    await waitFor(() => expect(requestedUrl).toContain("calendarId=c1"));
    expect(requestedUrl).toContain("groupId=g1");
    expect(requestedUrl).toContain("groupId=g2");
    expect(requestedUrl).toContain("start=");
    expect(requestedUrl).toContain("end=");
  });

  it("renders an event in the month grid", async () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    server.use(
      http.get("*/api/events", () =>
        HttpResponse.json({
          data: [
            {
              id: "e1",
              name: "Today's Event",
              startAt: today.toISOString(),
              endAt: null,
              allDay: true,
              description: null,
              notes: null,
              location: null,
              link: null,
              remindBefore: null,
              groupId: "g1",
            },
          ],
        }),
      ),
    );

    render(<CalendarViewLayout selectedCalendarId="c1" selectedGroupIds={["g1"]} />);

    await waitFor(() =>
      expect(screen.getByText("Today's Event")).toBeInTheDocument(),
    );
  });

  it("does not fetch events when no calendar is selected", async () => {
    let called = false;
    server.use(
      http.get("*/api/events", () => {
        called = true;
        return HttpResponse.json({ data: [] });
      }),
    );

    render(<CalendarViewLayout selectedCalendarId={null} />);

    await new Promise((r) => setTimeout(r, 50));
    expect(called).toBe(false);
  });
});
