import { test, expect } from "@playwright/test";
import { postLogline, uniqueContent } from "./helpers";

test.describe("ソート切り替え", () => {
  test("40: ソート切り替え", async ({ page }) => {
    const contentA = uniqueContent("sort popular");
    const contentB = uniqueContent("sort newest");

    // Post two loglines
    await postLogline(page, contentA);
    await postLogline(page, contentB);

    // Share logline A multiple times via API to boost its popularity
    await page.request.post("/api/share", {
      data: { id: contentA },
      headers: { "Content-Type": "application/json" },
    });
    await page.request.post("/api/share", {
      data: { id: contentA },
      headers: { "Content-Type": "application/json" },
    });
    await page.request.post("/api/share", {
      data: { id: contentA },
      headers: { "Content-Type": "application/json" },
    });

    // Popular sort: A should appear before B
    await page.goto("/?sort=popular");
    const popularOrder = await page.locator("article").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent || "")
    );
    const popularIndexA = popularOrder.findIndex((text) => text.includes(contentA));
    const popularIndexB = popularOrder.findIndex((text) => text.includes(contentB));
    expect(popularIndexA).toBeGreaterThanOrEqual(0);
    expect(popularIndexB).toBeGreaterThanOrEqual(0);
    expect(popularIndexA).toBeLessThan(popularIndexB);

    // Newest sort: B should appear before A (B posted later)
    await page.getByRole("link", { name: "新着順" }).click();
    await page.waitForURL(/sort=newest/);
    await expect(page).toHaveURL(/sort=newest/);
    const newestOrder = await page.locator("article").evaluateAll((nodes) =>
      nodes.map((node) => node.textContent || "")
    );
    const newestIndexA = newestOrder.findIndex((text) => text.includes(contentA));
    const newestIndexB = newestOrder.findIndex((text) => text.includes(contentB));
    expect(newestIndexA).toBeGreaterThanOrEqual(0);
    expect(newestIndexB).toBeGreaterThanOrEqual(0);
    expect(newestIndexB).toBeLessThan(newestIndexA);
  });
});
