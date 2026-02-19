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
});
