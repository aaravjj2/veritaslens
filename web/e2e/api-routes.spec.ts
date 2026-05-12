import { expect, test } from "@playwright/test";

/** Must match `webServer.env.CRON_SECRET` in playwright.config.ts */
const CRON_BEARER = "Bearer playwright-test-cron-secret";

test.describe("POST /api/cron/digest", () => {
  test("returns 401 without Authorization", async ({ request }) => {
    const res = await request.post("/api/cron/digest");
    expect(res.status()).toBe(401);
  });

  test("returns 401 with wrong secret", async ({ request }) => {
    const res = await request.post("/api/cron/digest", {
      headers: { Authorization: "Bearer wrong-secret" },
    });
    expect(res.status()).toBe(401);
  });

  test("returns 200 with valid secret", async ({ request }) => {
    const res = await request.post("/api/cron/digest", {
      headers: { Authorization: CRON_BEARER },
    });
    expect(res.status()).toBe(200);
    const body = (await res.json()) as {
      processed: number;
      emailed?: number;
      dryRun?: boolean;
    };
    expect(body).toHaveProperty("processed");
    expect(typeof body.processed).toBe("number");
    if ("emailed" in body) expect(typeof body.emailed).toBe("number");
  });
});

test.describe("POST /api/extension/token", () => {
  test("returns 401 when not signed in", async ({ request }) => {
    const res = await request.post("/api/extension/token");
    expect(res.status()).toBe(401);
  });
});

test.describe("GET /api/corrections", () => {
  test("returns 401 without session or bearer", async ({ request }) => {
    const res = await request.get("/api/corrections");
    expect(res.status()).toBe(401);
  });
});
