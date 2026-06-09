import { test, expect } from "@playwright/test";
import { postLogline, uniqueContent } from "./helpers";

test.describe("シェア", () => {
  test("41: シェアボタン", async ({ page }) => {
    const content = uniqueContent("share target");

    // Post a logline
    await postLogline(page, content);

    // Navigate to detail page
    await page.locator("a").filter({ hasText: content }).first().click();
    await expect(page.getByRole("heading", { name: content })).toBeVisible();

    // Mock navigator.share to avoid popup
    await page.evaluate(() => {
      (window as any).navigator.share = async () => {};
    });

    // Find share button and get initial count
    const shareButton = page.getByRole("button", { name: /シェア/ });
    await expect(shareButton).toBeVisible();

    // Click share once
    await shareButton.click();

    // Wait for API and count increment
    await expect(page.getByText("投稿しました！")).not.toBeVisible();
    // The toast for share might not show if navigator.share succeeds silently.
    // But the count should increase.
    await page.waitForTimeout(500);

    // Verify count increased to 1
    await expect(page.getByRole("button", { name: /シェア/ })).toContainText("1");

    // Click again immediately — should show debounce toast
    await shareButton.click();
    await expect(
      page.getByText("1分間はカウントされません")
    ).toBeVisible();

    // Count should still be 1
    await expect(page.getByRole("button", { name: /シェア/ })).toContainText("1");
  });
});
