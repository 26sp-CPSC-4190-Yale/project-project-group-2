import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../msw/server";

// react-pdf / pdfjs reach for a Worker + Canvas in the browser. Stub the
// PdfThumbnail component so FilesLayout tests stay pure-DOM.
vi.mock("@/components/files/PdfThumbnail", () => ({
  PdfThumbnail: () => null,
}));

import { FilesLayout } from "@/components/files/FilesLayout";

describe("<FilesLayout />", () => {
  it("lists files fetched from /api/files", async () => {
    server.use(
      http.get("*/api/files", () =>
        HttpResponse.json({
          data: [
            {
              id: "f1",
              name: "Syllabus.pdf",
              storagePath: "user/Syllabus.pdf",
              calendarId: null,
              calendar: null,
            },
          ],
        }),
      ),
    );

    render(<FilesLayout />);

    await waitFor(() => expect(screen.getByText("Syllabus.pdf")).toBeInTheDocument());
  });

  it("DELETEs a file when the user confirms the delete modal", async () => {
    let deleted = false;
    server.use(
      http.get("*/api/files", () =>
        HttpResponse.json({
          data: [
            {
              id: "f1",
              name: "Syllabus.pdf",
              storagePath: "user/Syllabus.pdf",
              calendarId: null,
              calendar: null,
            },
          ],
        }),
      ),
      http.delete("*/api/files/f1", () => {
        deleted = true;
        return HttpResponse.json({ data: { message: "File deleted" } });
      }),
    );

    const user = userEvent.setup();
    render(<FilesLayout />);

    await screen.findByText("Syllabus.pdf");

    await user.click(screen.getByLabelText(/File actions/i));
    await user.click(screen.getByText(/^Delete$/));
    // Confirm in the delete modal.
    const deleteButtons = screen.getAllByText(/^Delete$/);
    await user.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => expect(deleted).toBe(true));
    await waitFor(() => expect(screen.queryByText("Syllabus.pdf")).not.toBeInTheDocument());
  });

  it("renames a file via PATCH /api/files/:id", async () => {
    let patchBody: Record<string, unknown> | null = null;
    server.use(
      http.get("*/api/files", () =>
        HttpResponse.json({
          data: [
            {
              id: "f1",
              name: "Old.pdf",
              storagePath: "user/Old.pdf",
              calendarId: null,
              calendar: null,
            },
          ],
        }),
      ),
      http.get("*/api/calendars", () => HttpResponse.json({ data: [] })),
      http.patch("*/api/files/f1", async ({ request }) => {
        patchBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            id: "f1",
            name: (patchBody as { name: string }).name,
            storagePath: "user/Old.pdf",
            calendarId: null,
            calendar: null,
          },
        });
      }),
    );

    const user = userEvent.setup();
    render(<FilesLayout />);

    await screen.findByText("Old.pdf");
    await user.click(screen.getByLabelText(/File actions/i));
    await user.click(screen.getByText(/^Edit$/));

    const input = screen.getByDisplayValue("Old.pdf");
    await user.clear(input);
    await user.type(input, "New.pdf");

    await user.click(screen.getByText(/^Save$/));

    await waitFor(() => expect(patchBody).not.toBeNull());
    expect(patchBody).toEqual({ name: "New.pdf" });
  });
});
