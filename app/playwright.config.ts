import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:8100',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Tablet',
      use: {
        browserName: 'chromium',
        viewport: { width: 768, height: 1024 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Desktop',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
      },
    },
  ],

  webServer: {
    command: 'ionic serve --port=8100',
    url: 'http://localhost:8100',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
