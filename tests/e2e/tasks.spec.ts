import { test, expect, jsonData } from "./fixtures";

test.describe("Tasks (smoke)", () => {
  test("toggling a task in the sidebar PATCHes /api/tasks/:id with { completed: true }", async ({
    authedPage: page,
  }) => {
    await page.route("**/api/groups?calendarId=*", (route) =>
      route.fulfill(
        jsonData([{ id: "g-default", name: "Default Group", isDefault: true }]),
      ),
    );

    // A single upcoming task that the sidebar should surface.
    const dueSoon = new Date();
    dueSoon.setDate(dueSoon.getDate() + 2);
    await page.route("**/api/tasks?calendarId=*", (route) =>
      route.fulfill(
        jsonData([
          {
            id: "t-1",
            name: "E2E Task",
            completed: false,
            dueAt: dueSoon.toISOString(),
          },
        ]),
      ),
    );

    await page.route("**/api/events?calendarId=*", (route) =>
      route.fulfill(jsonData([])),
    );

    let patchBody: Record<string, unknown> | null = null;
    await page.route("**/api/tasks/t-1", (route, request) => {
      if (request.method() === "PATCH") {
        patchBody = JSON.parse(request.postData() ?? "{}") as Record<string, unknown>;
        return route.fulfill(
          jsonData({ id: "t-1", completed: true, name: "E2E Task" }),
        );
      }
      return route.fallback();
    });

    await page.goto("/");

    await expect(page.getByText("E2E Task")).toBeVisible();

    // Clicking the task row toggles completion.
    await page.getByText("E2E Task").click();

    await expect.poll(() => patchBody).not.toBeNull();
    expect(patchBody!.completed).toBe(true);
  });
});
