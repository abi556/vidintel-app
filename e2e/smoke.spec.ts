import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("home page shows hero and search", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1 })
    ).toContainText(/YouTube channel/i);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("compare page loads", async ({ page }) => {
    await page.goto("/compare");
    await expect(
      page.getByRole("heading", { name: /Compare YouTube Channels/i })
    ).toBeVisible();
  });

  test("offline page loads", async ({ page }) => {
    await page.goto("/~offline");
    await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();
  });

  test("manifest is valid JSON", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.ok()).toBeTruthy();
    const json = (await res.json()) as { name: string; short_name: string };
    expect(json.name).toContain("Vidintel");
    expect(json.short_name).toBe("Vidintel");
  });

  test("security headers on document", async ({ request }) => {
    const res = await request.get("/");
    expect(res.ok()).toBeTruthy();
    const headers = res.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["referrer-policy"]).toMatch(/strict-origin/i);
  });
});
