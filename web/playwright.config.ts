import { defineConfig, devices } from "@playwright/test";

const artifactMode = process.env.E2E_ARTIFACTS === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: !artifactMode,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  outputDir: artifactMode ? "../artifacts/e2e" : "test-results",
  reporter: artifactMode
    ? [
        ["list"],
        [
          "html",
          { open: "never", outputFolder: "../artifacts/playwright-report" },
        ],
      ]
    : [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
    video: artifactMode ? "on" : "retain-on-failure",
    screenshot: artifactMode ? "on" : "only-on-failure",
    trace: artifactMode ? "on" : "on-first-retry",
    ...(artifactMode
      ? {
          launchOptions: {
            slowMo: 320,
          },
        }
      : {}),
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    cwd: __dirname,
    timeout: 120_000,
    env: {
      CRON_SECRET: "playwright-test-cron-secret",
      EXTENSION_JWT_SECRET: "playwright-test-jwt-secret-32chars!!",
      NEXT_PUBLIC_ENABLE_SW: "1",
    },
  },
});
