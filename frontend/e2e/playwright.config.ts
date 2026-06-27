import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration (scaffold for future end-to-end tests).
 *
 * To enable:
 *   npm i -D @playwright/test && npx playwright install
 *   npx playwright test --config e2e/playwright.config.ts
 */
export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
