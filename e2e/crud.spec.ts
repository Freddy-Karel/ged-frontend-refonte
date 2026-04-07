import { test, expect } from "@playwright/test";

test.describe("Department CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/departments");
    await page.waitForSelector("[data-testid='departments-grid']");
  });

  test("should create a new department", async ({ page }) => {
    // Click create button
    await page.click("button:has-text('Nouveau')");

    // Fill form
    await page.fill("input[name='name']", "Test Department E2E");
    await page.fill("textarea[name='description']", "Description de test");

    // Submit
    await page.click("button[type='submit']");

    // Verify department appears in grid
    await expect(page.locator("text=Test Department E2E")).toBeVisible();
  });

  test("should navigate to department detail and show tabs", async ({ page }) => {
    // Click on first department card
    const firstCard = page.locator("[data-testid='department-card']").first();
    await firstCard.click();

    // Verify we're on detail page
    await expect(page).toHaveURL(/\/departments\/\d+/);

    // Verify tabs exist
    await expect(page.locator("text=Catégories")).toBeVisible();
    await expect(page.locator("text=Documents")).toBeVisible();

    // Click on Categories tab
    await page.click("text=Catégories");
    await expect(page.locator("[data-testid='category-list']")).toBeVisible();

    // Click on Documents tab
    await page.click("text=Documents");
    await expect(page.locator("[data-testid='document-list']")).toBeVisible();
  });
});

test.describe("Category CRUD in Department", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/departments");

    // Navigate to first department
    const firstCard = page.locator("[data-testid='department-card']").first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.click("text=Catégories");
    }
  });

  test("should create a new category", async ({ page }) => {
    // Click new category button
    await page.click("button:has-text('Nouvelle catégorie')");

    // Fill form
    await page.fill("input[name='name']", "Test Category E2E");
    await page.fill("textarea[name='description']", "Description catégorie test");

    // Submit
    await page.click("button[type='submit']");

    // Verify category appears in list
    await expect(page.locator("text=Test Category E2E")).toBeVisible();
  });
});
