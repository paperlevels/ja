import { test, expect } from "@playwright/test";

test("debug fill behavior", async ({ page }) => {
  test.skip();
  await page.goto("/");
  await expect(page.locator('form[data-hydrated="true"]')).toBeVisible();
  const button = page.getByRole("button", { name: "投稿する" });
  
  await expect(button).toBeDisabled();
  
  // Try fill
  await page.evaluate(() => {
    const textarea = document.querySelector(
      'textarea[name="content"]'
    ) as HTMLTextAreaElement | null;
    if (!textarea) throw new Error("textarea not found");
    textarea.focus();
    textarea.value = "hello world";
    textarea.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "hello world",
        inputType: "insertText",
      })
    );
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
  });

  await expect(button).toBeEnabled();
  
  // Check DOM value
  const domValue = await page.locator('textarea[name="content"]').inputValue();
  console.log("DOM value after fill:", domValue);
  const formHtml = await page.locator("form").evaluate((el) => el.outerHTML);
  console.log("Form HTML after fill:", formHtml);
  
  // Check React state via counter
  const counterText = await page
    .locator('span:text-matches("\\d+ / 140")')
    .textContent()
    .catch(() => "not found");
  console.log("Counter text:", counterText);
  
  // Check button state
  const isDisabled = await button.isDisabled();
  console.log("Button disabled:", isDisabled);
  
  expect(domValue).toBe("hello world");
});
