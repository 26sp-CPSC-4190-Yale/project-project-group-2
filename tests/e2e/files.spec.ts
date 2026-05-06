import { test, expect, jsonData } from "./fixtures";

test.describe("Files (smoke)", () => {
  test("files grid renders mocked files and the delete flow hits DELETE /api/files/:id", async ({
    authedPage: page,
  }) => {
    await page.route("**/api/files", (route, request) => {
      if (request.method() === "GET") {
        return route.fulfill(
          jsonData([
            {
              id: "f-1",
              name: "Syllabus.pdf",
              storagePath: "user/Syllabus.pdf",
              calendarId: null,
              calendar: null,
            },
          ]),
        );
      }
      return route.fallback();
    });

    // This smoke test does not cover PDF rendering, so use the placeholder path.
    await page.route("**/api/files/f-1/open", (route) =>
      route.fulfill(jsonData({ url: null })),
    );

    let deleteHit = false;
    await page.route("**/api/files/f-1", (route, request) => {
      if (request.method() === "DELETE") {
        deleteHit = true;
        return route.fulfill(jsonData({ message: "File deleted" }));
      }
      return route.fallback();
    });

    await page.goto("/files");

    await expect(page.getByText("Syllabus.pdf")).toBeVisible();

    // Open the per-file action menu and pick Delete.
    await page.getByRole("button", { name: /File actions/i }).click();
    await page.getByText(/^Delete$/).click();

    // Confirm the deletion in the modal.
    await page.getByRole("button", { name: /Delete/i }).last().click();

    await expect.poll(() => deleteHit).toBe(true);
    await expect(page.getByRole("heading", { name: "Delete File" })).not.toBeVisible();
    await expect(page.getByText("Syllabus.pdf")).toHaveCount(0);
  });
});
