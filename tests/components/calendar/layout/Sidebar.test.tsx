import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { DefaultSidebar, type SidebarCalendar } from "@/components/calendar/sidebar/DefaultSidebar";
import { server } from "../../../msw/server";

const calendars: SidebarCalendar[] = [
  { id: "c1", title: "My Calendar", isDefault: true },
  { id: "c2", title: "Work", isDefault: false },
];

describe("<Sidebar />", () => {
  it("lists the provided calendars", () => {
    render(
      <DefaultSidebar
        calendars={calendars}
        selectedCalendarId="c1"
        onSelectCalendar={() => {}}
      />,
    );
    expect(screen.getByText("My Calendar")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("fetches groups and tasks for the selected calendar on mount", async () => {
    server.use(
      http.get("*/api/groups", () =>
        HttpResponse.json({ data: [{ id: "g1", name: "Homework", isDefault: true }] }),
      ),
      http.get("*/api/tasks", () =>
        HttpResponse.json({
          data: [
            {
              id: "t1",
              name: "Due tomorrow",
              completed: false,
              dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        }),
      ),
    );

    render(
      <DefaultSidebar
        calendars={calendars}
        selectedCalendarId="c1"
        onSelectCalendar={() => {}}
      />,
    );

    await waitFor(() => expect(screen.getByText("Homework")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Due tomorrow")).toBeInTheDocument());
  });

  it("PATCHes a task when the user toggles its completion", async () => {
    let patchBody: Record<string, unknown> | null = null;
    server.use(
      http.get("*/api/groups", () =>
        HttpResponse.json({ data: [{ id: "g1", name: "Homework", isDefault: true }] }),
      ),
      http.get("*/api/tasks", () =>
        HttpResponse.json({
          data: [
            {
              id: "t1",
              name: "My Task",
              completed: false,
              dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
        }),
      ),
      http.patch("*/api/tasks/t1", async ({ request }) => {
        patchBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ data: { id: "t1" } });
      }),
    );

    const user = userEvent.setup();
    render(
      <DefaultSidebar
        calendars={calendars}
        selectedCalendarId="c1"
        onSelectCalendar={() => {}}
      />,
    );

    const taskRow = await screen.findByText("My Task");
    await user.click(taskRow);

    await waitFor(() => expect(patchBody).not.toBeNull());
    expect(patchBody).toEqual({ completed: true });
  });
});
