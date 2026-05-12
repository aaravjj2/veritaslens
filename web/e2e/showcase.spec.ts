import { expect, test, type Page } from "@playwright/test";

function dwell(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function capture(page: Page, slug: string) {
  await page.screenshot({
    path: test.info().outputPath(`capture-${slug}.png`),
    fullPage: true,
  });
}

/** Full guided tour with dwell + full-page PNGs; run via `npm run e2e:artifacts` only. */
if (process.env.E2E_ARTIFACTS === "1") {
  test.describe("Product showcase (video + screenshots)", () => {
    test.describe.configure({ mode: "serial" });

    test("guided tour — landing, analyse, history, settings, extension, login, offline", async ({
      page,
      context,
    }) => {
    test.setTimeout(180_000);

    const finalPayload = {
      type: "final" as const,
      language: "en",
      overall_score: 88,
      summary: "Looks consistent with reputable sourcing.",
      tactics: [
        {
          name: "no-issues",
          explanation: "No major rhetorical red flags.",
          severity: "low",
        },
      ],
      sentences: [
        {
          text: "The European Parliament met on Tuesday.",
          score: 90,
          issues: ["no-issues"],
          source_ids: [],
        },
      ],
      share_id: "00000000-0000-4000-8000-000000000099",
    };

    const ndjson =
      `${JSON.stringify({ type: "delta", text: "" })}\n` +
      `${JSON.stringify(finalPayload)}\n`;

    await page.route("**/api/analyse", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/x-ndjson; charset=utf-8",
        body: ndjson,
      });
    });

    await test.step("Landing", async () => {
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "VeritasLens", exact: true }),
      ).toBeVisible();
      await dwell(500);
      await capture(page, "01-landing");
    });

    await test.step("Web analyser (mocked stream)", async () => {
      await page.getByRole("link", { name: "Web analyser" }).click();
      await page.waitForURL("**/analyse");
      await expect(
        page.getByPlaceholder("Paste suspicious paragraphs here…"),
      ).toBeVisible();
      await dwell(400);
      await capture(page, "02-analyse-empty");

      await page
        .getByPlaceholder("Paste suspicious paragraphs here…")
        .fill(
          "The European Parliament met on Tuesday. This sentence is used for the demo credibility run.",
        );
      await dwell(350);
      await page.getByRole("button", { name: "Run analysis" }).click();
      await expect(page.getByText("Overall credibility")).toBeVisible({
        timeout: 20_000,
      });
      await expect(page.getByText(/\b88\b/)).toBeVisible();
      await dwell(900);
      await capture(page, "03-analyse-result");
    });

    await test.step("History", async () => {
      await page.goto("/dashboard");
      await expect(
        page.getByRole("heading", { name: "Analysis history" }),
      ).toBeVisible();
      await dwell(500);
      await capture(page, "04-dashboard");
    });

    await test.step("Settings", async () => {
      await page.goto("/settings");
      await expect(
        page.getByRole("heading", { name: "Account settings" }),
      ).toBeVisible();
      await dwell(500);
      await capture(page, "05-settings");
    });

    await test.step("Extension token flow", async () => {
      await page.goto("/extension/connect");
      await expect(page.getByTestId("extension-connect-heading")).toBeVisible();
      await dwell(450);
      await capture(page, "06-extension-connect");

      await page.getByRole("button", { name: "Generate token" }).click();
      await expect(page.getByTestId("extension-token-error")).toContainText(
        "Unauthorized",
        { timeout: 15_000 },
      );
      await dwell(600);
      await capture(page, "07-extension-unauthorized");
    });

    await test.step("Sign in page", async () => {
      await page.goto("/login");
      await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
      await dwell(500);
      await capture(page, "08-login");
    });

    await test.step("Offline shell (service worker)", async () => {
      await page.goto("/");
      await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.register("/sw.js");
        await reg.update();
        await navigator.serviceWorker.ready;
      });
      await page.reload();
      await page.waitForFunction(
        () =>
          Boolean(
            navigator.serviceWorker.controller?.scriptURL.includes("sw.js"),
          ),
        { timeout: 25_000 },
      );
      await dwell(500);
      await capture(page, "09-home-sw-ready");

      await context.setOffline(true);
      try {
        await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
        await expect(page.getByTestId("offline-title")).toBeVisible({
          timeout: 25_000,
        });
        await dwell(700);
        await capture(page, "10-offline-shell");
      } finally {
        await context.setOffline(false);
      }
    });
  });
});
}

