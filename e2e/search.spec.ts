import { test, expect } from "@playwright/test";
import { postLogline, uniqueContent } from "./helpers";

test.describe("検索", () => {
  test("39: 検索フロー", async ({ page }) => {
    const unique = uniqueContent("search target");
    const keyword = unique.split(" ").pop()!;

    // Post a unique logline
    await postLogline(page, unique);

    // Search for the unique keyword
    await page.goto(`/?q=${encodeURIComponent(keyword)}`);
    await expect(
      page.locator("article").filter({ hasText: unique })
    ).toBeVisible();

    // Search for something that doesn't exist
    await page.goto("/?q=XYZ999NONEXISTENT");
    await expect(page.getByText("まだ投稿がありません")).toBeVisible();
  });
});
