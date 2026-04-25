import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { CreateEventModal } from "@/components/calendar/modals/CreateEventModal";
import { server } from "../../../msw/server";

describe("<CreateEventModal />", () => {
  it("loads groups from the API on mount", async () => {
    server.use(
      http.get("*/api/groups", () =>
        HttpResponse.json({
          data: [
            { id: "g1", name: "Work", isDefault: false },
            { id: "g2", name: "Personal", isDefault: false },
          ],
        }),
      ),
    );

    render(<CreateEventModal calendarId="c1" onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Work|Personal/)).toBeInTheDocument();
    });
  });

  it("submits a POST to /api/events with the entered name and date", async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.get("*/api/groups", () =>
        HttpResponse.json({ data: [{ id: "g1", name: "Work" }] }),
      ),
      http.post("*/api/events", async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ data: { id: "e-new" } }, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    render(<CreateEventModal calendarId="c1" onClose={() => {}} />);

    await waitFor(() => screen.getByText("Work"));

    const nameInput = screen.getAllByRole("textbox")[0];
    await user.type(nameInput, "Team sync");

    const dateInputs = screen
      .getAllByDisplayValue("")
      .filter((el): el is HTMLInputElement => (el as HTMLInputElement).type === "date");
    await user.type(dateInputs[0], "2026-06-15");

    await user.click(screen.getByText(/Create/));

    await waitFor(() => expect(capturedBody).not.toBeNull());
    expect(capturedBody).toMatchObject({
      calendarId: "c1",
      name: "Team sync",
      allDay: true,
    });
    expect((capturedBody as { startAt: string }).startAt).toContain("2026-06-15");
  });

  it("does nothing when no start date is entered", async () => {
    let posted = false;
    server.use(
      http.get("*/api/groups", () =>
        HttpResponse.json({ data: [{ id: "g1", name: "Work" }] }),
      ),
      http.post("*/api/events", () => {
        posted = true;
        return HttpResponse.json({ data: {} }, { status: 201 });
      }),
    );

    const user = userEvent.setup();
    render(<CreateEventModal calendarId="c1" onClose={() => {}} />);

    await waitFor(() => screen.getByText("Work"));
    await user.click(screen.getByText(/Create/));

    await new Promise((r) => setTimeout(r, 50));
    expect(posted).toBe(false);
  });
});
