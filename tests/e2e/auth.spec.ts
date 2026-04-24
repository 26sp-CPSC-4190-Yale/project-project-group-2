import { test, expect } from "./fixtures";

test.describe("Authentication", () => {
  test("unauthenticated user is redirected from / to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("login page renders the Google OAuth button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/Login with Google/i)).toBeVisible();
  });

  test("clicking Login with Google navigates to /api/auth/google", async ({ page }) => {
    await page.goto("/login");

    // Intercept the OAuth redirect so we don't actually hit Google.
    await page.route("**/api/auth/google", (route) =>
      route.fulfill({ status: 204, body: "" }),
    );

    const [req] = await Promise.all([
      page.waitForRequest("**/api/auth/google"),
      page.getByText(/Login with Google/i).click(),
    ]);
    expect(req.url()).toContain("/api/auth/google");
  });

  test("authenticated user reaches the home calendar page", async ({ authedPage: page }) => {
    // After logging in via /api/test/login, going to / should no longer redirect.
    await page.goto("/");
    await expect(page).toHaveURL(/^http:\/\/localhost:4000\/?$/);
  });
});
