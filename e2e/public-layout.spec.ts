import { test, expect } from "@playwright/test";

test.describe("Public base layout", () => {
  test("homepage has header and main landmarks, home link, and search input", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    const main = page.locator("main");
    await expect(header).toBeVisible();
    await expect(main).toBeVisible();

    const homeLink = header.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();

    const searchInput = page.getByLabel("Search units");
    await expect(searchInput).toBeVisible();
  });

  test("skip-to-content link becomes visible on focus and targets main", async ({ page }) => {
    await page.goto("/");

    const skipLink = page.locator("a.skip-link");
    await expect(skipLink).toBeAttached();
    await expect(skipLink).not.toBeInViewport();

    await page.keyboard.press("Tab");
    await expect(skipLink).toBeInViewport();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  test("404 page renders with Base layout and back link", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");

    await expect(page).toHaveTitle(/Page not found/);
    await expect(page.locator("h1")).toHaveText("Page not found");

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const backLink = page.locator('a[href="/"]', { hasText: "Back to the index" });
    await expect(backLink).toBeVisible();
  });
});
