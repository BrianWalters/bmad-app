import { test, expect } from "@playwright/test";

test.describe("Search results page", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ request }) => {
    await request.post("/api/fixtures");
  });

  test("submitting a search query shows matching results with unit names and descriptions", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator(".search-form__input").fill("Detail");
    await page.locator(".search-form__button").click();

    await expect(page).toHaveURL(/\/search\?q=Detail/);
    await expect(page.locator(".search-results__item")).toHaveCount(1);
    await expect(page.locator(".search-results__name")).toHaveText("E2E Detail Test Unit");
    await expect(page.locator(".search-results__description")).toContainText(
      "E2E testing of the detail page",
    );
  });

  test("clicking a search result navigates to the correct detail page", async ({ page }) => {
    await page.goto("/search?q=Detail");

    await page.locator(".search-results__name").first().click();

    await expect(page).toHaveURL(/\/units\/e2e-unit-detail-test$/);
    await expect(page.locator("h1")).toHaveText("E2E Detail Test Unit");
  });

  test("searching for a non-existent unit shows empty state message", async ({ page }) => {
    await page.goto("/search?q=ZZZZZ");

    await expect(page.locator(".empty-state")).toContainText(
      'No units found matching \u201cZZZZZ\u201d.',
    );
    await expect(page.locator(".search-results")).toHaveCount(0);
  });

  test("submitting an empty search redirects to index", async ({ page }) => {
    await page.goto("/search?q=");

    await expect(page).toHaveURL("/");
  });

  test("submitting a whitespace-only search redirects to index", async ({ page }) => {
    await page.goto("/search?q=%20%20%20");

    await expect(page).toHaveURL("/");
  });

  test("search results page has breadcrumb with Home link back to index", async ({ page }) => {
    await page.goto("/search?q=E2E");

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.locator('a[href="/"]')).toHaveText("Home");
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText("Search Results");

    await breadcrumb.locator('a[href="/"]').click();
    await expect(page).toHaveURL("/");
  });

  test("clicking site name in header from search results navigates to index", async ({
    page,
  }) => {
    await page.goto("/search?q=E2E");

    await page.locator(".site-header__title").click();
    await expect(page).toHaveURL("/");
  });

  test("search results page has logical heading hierarchy", async ({ page }) => {
    await page.goto("/search?q=E2E");

    await expect(page.locator("h1")).toHaveText("Search Results");

    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);
  });

  test("partial name search returns matching units", async ({ page }) => {
    await page.goto("/search?q=E2E");

    const items = page.locator(".search-results__item");
    await expect(items).toHaveCount(2);

    const names = await page.locator(".search-results__name").allTextContents();
    expect(names).toContain("E2E Detail Test Unit");
    expect(names).toContain("E2E No Description Unit");
  });

  test("result without description shows only the name", async ({ page }) => {
    await page.goto("/search?q=No Description");

    await expect(page.locator(".search-results__item")).toHaveCount(1);
    await expect(page.locator(".search-results__name")).toHaveText("E2E No Description Unit");
    await expect(page.locator(".search-results__description")).toHaveCount(0);
  });
});
