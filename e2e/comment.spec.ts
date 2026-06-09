import { test, expect } from "@playwright/test";
import { postLogline, uniqueContent } from "./helpers";

test.describe("コメント投稿", () => {
  test("38: コメント投稿フロー", async ({ page }) => {
    const content = uniqueContent("comment target");

    // Post a logline
    await postLogline(page, content);

    // Navigate to detail page
    await page.locator("a").filter({ hasText: content }).first().click();
    await expect(page.getByRole("heading", { name: content })).toBeVisible();

    // Post a comment
    const commentText = uniqueContent("comment body");
    await page
      .getByPlaceholder("コメントを入力（Markdown対応）")
      .fill(commentText);
    await Promise.all([
      page.waitForResponse(
        (res) =>
          res.url().includes("/api/comments") &&
          res.request().method() === "POST" &&
          res.status() === 200
      ),
      page.getByRole("button", { name: "コメントする" }).click(),
    ]);

    await expect(page.getByText("コメントを投稿しました")).toBeVisible();
    await expect(page.getByText(commentText)).toBeVisible();
  });
});
