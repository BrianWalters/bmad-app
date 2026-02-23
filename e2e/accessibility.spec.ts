import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe.configure({ mode: "serial" });

test.describe("WCAG AA accessibility", () => {
  test.beforeAll(async ({ request }) => {
    await request.post("/api/fixtures");
  });

  test("index page passes WCAG AA", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("unit detail page passes WCAG AA", async ({ page }) => {
    await page.goto("/units/e2e-unit-detail-test");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("unit detail page without optional fields passes WCAG AA", async ({ page }) => {
    await page.goto("/units/e2e-unit-detail-no-desc");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("search results page passes WCAG AA", async ({ page }) => {
    await page.goto("/search?q=E2E");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("search empty state passes WCAG AA", async ({ page }) => {
    await page.goto("/search?q=ZZZZZ");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("404 page passes WCAG AA", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
