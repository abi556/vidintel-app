import { test, expect } from "@playwright/test";

test.describe("api/channel", () => {
  test("returns 400 for invalid JSON body", async ({ request }) => {
    const res = await request.post("/api/channel", {
      headers: { "Content-Type": "application/json" },
      data: "not-json{",
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_URL");
  });

  test("returns 400 for empty input", async ({ request }) => {
    const res = await request.post("/api/channel", {
      data: { input: "" },
    });
    expect(res.status()).toBe(400);
  });
});
