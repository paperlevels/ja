import { expect, type Page } from "@playwright/test";

export async function postLogline(page: Page, content: string) {
  await page.goto("/");
  // Wait for the React island to hydrate before typing.
  await expect(page.locator('form[data-hydrated="true"]')).toBeVisible();
  const submitButton = page.getByRole("button", { name: "投稿する" });
  await expect(submitButton).toBeDisabled();
  await page.evaluate((text) => {
    const textarea = document.querySelector(
      'textarea[name="content"]'
    ) as HTMLTextAreaElement | null;
    if (!textarea) {
      throw new Error("textarea[name=\"content\"] not found");
    }
    textarea.focus();
    textarea.value = text;
    textarea.dispatchEvent(
      new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" })
    );
    textarea.dispatchEvent(new Event("change", { bubbles: true }));
  }, content);
  await expect
    .poll(async () =>
      submitButton.evaluate((el) => (el as HTMLButtonElement).disabled)
    )
    .toBe(false);
  await submitButton.click();
  await page.waitForSelector("text=投稿しました！");
}

export function uniqueContent(base: string): string {
  return `E2E ${base} ${Date.now()} ${Math.floor(Math.random() * 1000000)}`;
}
