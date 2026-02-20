import { test, expect } from "@playwright/test";

const SLUG = "e2e-unit-detail-test";
const SLUG_NO_DESC = "e2e-unit-detail-no-desc";

test.describe("Unit detail page", () => {
  test("renders page with unit name as h1, breadcrumb, attributes in dl, and model sections", async ({
    page,
  }) => {
    await page.goto(`/units/${SLUG}`);

    await expect(page).toHaveTitle("E2E Detail Test Unit — Army Builder");

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.locator('a[href="/"]')).toHaveText("Home");
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText("E2E Detail Test Unit");

    await expect(page.locator("h1")).toHaveText("E2E Detail Test Unit");

    const keywords = page.locator(".unit-detail__keywords");
    await expect(keywords).toBeVisible();

    const dl = page.locator("dl.unit-detail__attributes");
    await expect(dl).toBeVisible();
    await expect(dl.locator("dt")).toHaveCount(7);
    await expect(dl.locator("dt").nth(0)).toHaveText("Movement");
    await expect(dl.locator("dd").nth(0)).toHaveText('6"');
    await expect(dl.locator("dt").nth(2)).toHaveText("Save");
    await expect(dl.locator("dd").nth(2)).toHaveText("3+");
    await expect(dl.locator("dt").nth(6)).toHaveText("Invulnerability Save");
    await expect(dl.locator("dd").nth(6)).toHaveText("4+");

    const modelSections = page.locator(".unit-detail__model");
    await expect(modelSections).toHaveCount(2);
  });

  test("groups identical models and shows quantity prefix", async ({ page }) => {
    await page.goto(`/units/${SLUG}`);

    const modelSections = page.locator(".unit-detail__model");
    const firstHeading = modelSections.nth(0).locator("h3");
    await expect(firstHeading).toHaveText("Test Heavy");

    const secondHeading = modelSections.nth(1).locator("h3");
    await expect(secondHeading).toHaveText("2 Test Warrior");
  });

  test("equipment tables show default vs alternative distinction", async ({ page }) => {
    await page.goto(`/units/${SLUG}`);

    const warriorSection = page.locator(".unit-detail__model", { hasText: "Test Warrior" });

    const defaultRows = warriorSection.locator("tr.unit-detail__equipment--default");
    await expect(defaultRows.first()).toContainText("(Default)");

    const altRows = warriorSection.locator("tbody tr:not(.unit-detail__equipment--default)");
    await expect(altRows.first()).not.toContainText("(Default)");
  });

  test("splits equipment into ranged and melee tables with correct skill headers", async ({
    page,
  }) => {
    await page.goto(`/units/${SLUG}`);

    const warriorSection = page.locator(".unit-detail__model", { hasText: "Test Warrior" });

    await expect(warriorSection.locator("h4").nth(0)).toHaveText("Ranged Weapons");
    await expect(warriorSection.locator("h4").nth(1)).toHaveText("Melee Weapons");

    const rangedHeaders = warriorSection.locator("table").nth(0).locator("th");
    await expect(rangedHeaders.nth(3)).toHaveText("BS");

    const meleeHeaders = warriorSection.locator("table").nth(1).locator("th");
    await expect(meleeHeaders.nth(2)).toHaveText("WS");
  });

  test("displays damage using dice notation", async ({ page }) => {
    await page.goto(`/units/${SLUG}`);

    const warriorSection = page.locator(".unit-detail__model", { hasText: "Test Warrior" });
    const rangedDamage = warriorSection.locator("table").nth(0).locator("tbody td").last();
    await expect(rangedDamage).toHaveText("1");

    const meleeDamage = warriorSection.locator("table").nth(1).locator("tbody td").last();
    await expect(meleeDamage).toHaveText("D3");

    const heavySection = page.locator(".unit-detail__model", { hasText: "Test Heavy" });
    const heavyRangedDamage = heavySection.locator("table").nth(0).locator("tbody td").last();
    await expect(heavyRangedDamage).toHaveText("D6");

    const heavyMeleeDamage = heavySection.locator("table").nth(1).locator("tbody td").last();
    await expect(heavyMeleeDamage).toHaveText("2");
  });

  test("displays AP as negative numbers", async ({ page }) => {
    await page.goto(`/units/${SLUG}`);

    const warriorSection = page.locator(".unit-detail__model", { hasText: "Test Warrior" });
    const rangedRow = warriorSection.locator("table").nth(0).locator("tbody tr").first();
    const apCell = rangedRow.locator("td").nth(5);
    await expect(apCell).toHaveText("-1");
  });

  test("returns 404 for non-existent slug", async ({ page }) => {
    const response = await page.goto("/units/this-slug-does-not-exist-ever");
    expect(response?.status()).toBe(404);
  });

  test("description renders inside a details element", async ({ page }) => {
    await page.goto(`/units/${SLUG}`);

    const details = page.locator("details");
    await expect(details).toBeVisible();
    await expect(details.locator("summary")).toHaveText("Description");
    await expect(details.locator("p")).toContainText("E2E testing of the detail page");
  });

  test("omits invulnerability save when null", async ({ page }) => {
    await page.goto(`/units/${SLUG_NO_DESC}`);

    const dl = page.locator("dl.unit-detail__attributes");
    const dtTexts = await dl.locator("dt").allTextContents();
    expect(dtTexts).not.toContain("Invulnerability Save");
  });

  test("omits description details element when no description", async ({ page }) => {
    await page.goto(`/units/${SLUG_NO_DESC}`);

    await expect(page.locator("details")).toHaveCount(0);
  });
});
