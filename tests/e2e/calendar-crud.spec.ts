import { test, expect, jsonData } from "./fixtures";

test.describe("Calendar event creation (smoke)", () => {
  test("filling the New Event form posts to /api/events with the right payload", async ({
    authedPage: page,
  }) => {
    // Stub the groups list the AddNewMenu fetches on mount.
    await page.route("**/api/groups?calendarId=*", (route) =>
      route.fulfill(
        jsonData([{ id: "g-default", name: "Default Group", isDefault: true }]),
      ),
    );

    // Stub the events list used by the calendar view.
    await page.route("**/api/events?calendarId=*", (route) =>
      route.fulfill(jsonData([])),
    );

    // Capture the POST body when the user submits.
    let postBody: Record<string, unknown> | null = null;
    await page.route("**/api/events", (route, request) => {
      if (request.method() === "POST") {
        postBody = JSON.parse(request.postData() ?? "{}") as Record<string, unknown>;
        return route.fulfill(
          jsonData(
            { id: "e-new", name: postBody.name, startAt: postBody.startAt },
            201,
          ),
        );
      }
      return route.fallback();
    });

    await page.goto("/");

    // Open the Add New modal.
    await page.getByText(/^Add Event$/i).first().click();

    // Fill the form.
    await page.getByLabel(/Name/i).first().fill("E2E Event");
    await page.getByLabel(/Start Date/i).first().fill("2026-06-15");

    await page.getByRole("button", { name: /^Create$/ }).click();

    await expect.poll(() => postBody).not.toBeNull();
    expect(postBody!).toMatchObject({ name: "E2E Event" });
  });
});
