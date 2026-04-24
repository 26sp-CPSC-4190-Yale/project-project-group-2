import { test, expect, jsonData } from "./fixtures";

test.describe("Invitations (smoke)", () => {
  test("sharing an event posts to /api/invitations with { eventId, recipientEmail }", async ({
    authedPage: page,
  }) => {
    await page.route("**/api/groups?calendarId=*", (route) =>
      route.fulfill(
        jsonData([{ id: "g-default", name: "Default Group", isDefault: true }]),
      ),
    );

    await page.route("**/api/tasks?calendarId=*", (route) =>
      route.fulfill(jsonData([])),
    );

    // One event in the month view so we can open it.
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    await page.route("**/api/events?calendarId=*", (route) =>
      route.fulfill(
        jsonData([
          {
            id: "e-1",
            name: "Study session",
            startAt: today.toISOString(),
            endAt: null,
            allDay: true,
            description: null,
            notes: null,
            location: null,
            link: null,
            remindBefore: null,
            groupId: "g-default",
          },
        ]),
      ),
    );

    let postBody: Record<string, unknown> | null = null;
    await page.route("**/api/invitations", (route, request) => {
      if (request.method() === "POST") {
        postBody = JSON.parse(request.postData() ?? "{}") as Record<string, unknown>;
        return route.fulfill(
          jsonData({ id: "inv-1", status: "PENDING" }, 201),
        );
      }
      return route.fallback();
    });

    await page.goto("/");

    // Open event → Share modal.
    await page.getByText("Study session").first().click();
    await page.getByRole("button", { name: /Share/i }).click();

    await page.getByPlaceholder(/email/i).fill("friend@example.com");
    await page.getByRole("button", { name: /Send|Invite|Share/i }).last().click();

    await expect.poll(() => postBody).not.toBeNull();
    expect(postBody!).toMatchObject({
      eventId: "e-1",
      recipientEmail: "friend@example.com",
    });
  });
});
