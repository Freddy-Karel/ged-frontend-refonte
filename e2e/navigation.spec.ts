import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should navigate to dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toContainText("Tableau de bord");
  });

  test("should navigate to departments page", async ({ page }) => {
    await page.goto("/departments");
    await expect(page).toHaveURL("/departments");
    await expect(page.locator("h1")).toContainText("Départements");
  });

  test("should redirect /categories to /departments", async ({ page }) => {
    await page.goto("/categories");
    await expect(page).toHaveURL("/departments");
  });

  test("should navigate to documents page", async ({ page }) => {
    await page.goto("/documents");
    await expect(page).toHaveURL("/documents");
    await expect(page.locator("h1")).toContainText("Documents");
  });
});

test.describe("Departments", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/departments");
  });

  test("should display departments grid", async ({ page }) => {
    await expect(page.locator("[data-testid='departments-grid']")).toBeVisible();
  });

  test("should open create department dialog", async ({ page }) => {
    await page.click("text=Nouveau");
    await expect(page.locator("text=Créer un département")).toBeVisible();
  });

  test("should navigate to department detail", async ({ page }) => {
    const firstCard = page.locator("[data-testid='department-card']").first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await expect(page).toHaveURL(/\/departments\/\d+/);
    }
  });
});
