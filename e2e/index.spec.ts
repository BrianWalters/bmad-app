import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test.describe("Unit index page", () => {
  test.beforeAll(async ({ request }) => {
    await request.post("/api/fixtures");
  });

  test("shows all seeded units as cards with unit names visible", async ({ page }) => {
    await page.goto("/");

    const cards = page.locator(".unit-card");
    await expect(cards).toHaveCount(2);

    await expect(cards.nth(0)).toContainText("E2E Detail Test Unit");
    await expect(cards.nth(1)).toContainText("E2E No Description Unit");
  });

  test("units are displayed in alphabetical order", async ({ page }) => {
    await page.goto("/");

    const names = page.locator(".unit-card__name");
    const allNames = await names.allTextContents();

    expect(allNames.length).toBeGreaterThanOrEqual(2);
    const sorted = [...allNames].sort((a, b) => a.localeCompare(b));
    expect(allNames).toEqual(sorted);
  });

  test("clicking a unit heading link navigates to the correct detail page", async ({ page }) => {
    await page.goto("/");

    const firstLink = page.locator(".unit-card__name a").first();
    await firstLink.click();

    await expect(page).toHaveURL(/\/units\/e2e-unit-detail-test$/);
    await expect(page.locator("h1")).toHaveText("E2E Detail Test Unit");
  });

  test("page has logical heading hierarchy", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveText("Army Builder");

    const h2Elements = page.locator(".unit-card__name");
    await expect(h2Elements).toHaveCount(2);

    for (const h2 of await h2Elements.all()) {
      const tagName = await h2.evaluate((el) => el.tagName);
      expect(tagName).toBe("H2");
    }
  });

  test("cards are keyboard-navigable", async ({ page }) => {
    await page.goto("/");

    const firstCardLink = page.locator(".unit-card__name a").first();
    await firstCardLink.focus();
    await expect(firstCardLink).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/units\/e2e-unit-detail-test$/);
  });

  test("clicking site name in header navigates to index", async ({ page }) => {
    await page.goto("/units/e2e-unit-detail-test");
    await page.locator(".site-header__title").click();
    await expect(page).toHaveURL("/");
  });

  test("clicking Home in breadcrumb navigates to index", async ({ page }) => {
    await page.goto("/units/e2e-unit-detail-test");
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await breadcrumb.locator('a[href="/"]').click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Unit index page — empty state", () => {
  test.beforeAll(async ({ request }) => {
    await request.post("/api/fixtures?type=empty");
  });

  test("shows empty state message when no units exist", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator(".empty-state")).toHaveText("No units yet.");
    await expect(page.locator(".unit-card")).toHaveCount(0);
  });
});
