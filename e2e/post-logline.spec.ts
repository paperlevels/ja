import { test, expect } from "@playwright/test";
import { postLogline, uniqueContent } from "./helpers";

test.describe("ログライン投稿", () => {
  test("35: ログライン投稿フロー", async ({ page }) => {
    const content = uniqueContent("post flow");
    await postLogline(page, content);

    await expect(page.getByText("投稿しました！")).toBeVisible();
    await expect(
      page.locator("article").filter({ hasText: content })
    ).toBeVisible();
  });

  test("36: 140文字カウンタ", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('form[data-hydrated="true"]')).toBeVisible();
    const submitButton = page.getByRole("button", { name: "投稿する" });

    // Empty: button disabled
    await expect(submitButton).toBeDisabled();

    // Fill to 140 chars
    const text = "a".repeat(140);
    await page.evaluate((value) => {
      const textarea = document.querySelector(
        'textarea[name="content"]'
      ) as HTMLTextAreaElement | null;
      if (!textarea) throw new Error("textarea not found");
      textarea.focus();
      textarea.value = value;
      textarea.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: value,
          inputType: "insertText",
        })
      );
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }, text);

    // Counter shows 140 / 140 in red
    const counter = page.locator('form[data-hydrated="true"] span').first();
    await expect(counter).toBeVisible();
    await expect(counter).toHaveClass(/text-destructive/);

    // Button is enabled at exactly 140
    await expect
      .poll(async () => submitButton.evaluate((el) => (el as HTMLButtonElement).disabled))
      .toBe(false);
  });

  test("37: 禁止文字バリデーション", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('form[data-hydrated="true"]')).toBeVisible();
    const submitButton = page.getByRole("button", { name: "投稿する" });
    await expect(submitButton).toBeDisabled();

    // Type forbidden char /
    await page.evaluate((value) => {
      const textarea = document.querySelector(
        'textarea[name="content"]'
      ) as HTMLTextAreaElement | null;
      if (!textarea) throw new Error("textarea not found");
      textarea.focus();
      textarea.value = value;
      textarea.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: value,
          inputType: "insertText",
        })
      );
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }, "test / content");

    // Error message appears
    await expect(page.locator("form")).toContainText(
      "URLに使用される文字（/ ? & # % \\ など）は使用できません"
    );

    // Submit button is disabled
    await expect(submitButton).toBeDisabled();

    // Also test with ?
    await page.evaluate((value) => {
      const textarea = document.querySelector(
        'textarea[name="content"]'
      ) as HTMLTextAreaElement | null;
      if (!textarea) throw new Error("textarea not found");
      textarea.focus();
      textarea.value = value;
      textarea.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: value,
          inputType: "insertText",
        })
      );
      textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }, "test ? content");
    await expect(
      page.getByText(/URLに使用される文字/)
    ).toBeVisible();
    await expect(submitButton).toBeDisabled();
  });
});
