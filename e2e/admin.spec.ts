import { test, expect } from "@playwright/test";
import { postLogline, uniqueContent } from "./helpers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

test.describe("管理者機能", () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    "ADMIN_EMAIL and ADMIN_PASSWORD env vars are required"
  );

  test("42: 管理者ログイン〜削除", async ({ page }) => {
    // Listen for browser logs and errors
    page.on("console", (msg) => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on("pageerror", (err) => console.error(`[Browser Error] ${err.message}`));

    const content = uniqueContent("admin delete target");

    // Post a logline to delete later
    await postLogline(page, content);

    // Navigate to admin login
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: "管理者ログイン" })).toBeVisible();
    await expect(page.locator('form[data-hydrated="true"]')).toBeVisible();

    // Login
    const emailInput = page.locator("input#email");
    const passwordInput = page.locator("input#password");
    await emailInput.click();
    await emailInput.fill(ADMIN_EMAIL!);
    await passwordInput.click();
    await passwordInput.fill(ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page.getByRole("heading", { name: "管理画面" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('div[data-hydrated="true"]')).toBeVisible({
      timeout: 10000,
    });

    // Verify the logline appears in the table
    const row = page.locator("table tbody tr").filter({ hasText: content });
    await expect(row).toBeVisible({ timeout: 10000 });

    // Delete the logline
    const deleteButton = row.getByRole("button", { name: "削除" }).first();
    await expect(deleteButton).toBeEnabled();
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/admin/delete-logline") &&
          res.request().method() === "POST" &&
          res.status() === 200
      ),
      deleteButton.click(),
    ]);

    await expect(row).toHaveCount(0);
  });
});
