import { defineConfig } from '@playwright/test';
const base = process.env.BASE_PATH ?? '/';
export default defineConfig({
  testDir: './tests/browser', timeout: 40_000, fullyParallel: false,
  use: { baseURL: `http://127.0.0.1:4173${base}`, viewport: { width: 430, height: 932 }, timezoneId: 'Asia/Bangkok', serviceWorkers: 'allow', screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }, ...(process.env.TEST_WEBKIT ? [{ name: 'webkit', use: { browserName: 'webkit' as const } }] : [])],
  webServer: { command: 'npm run preview -- --port 4173 --strictPort', url: `http://127.0.0.1:4173${base}`, reuseExistingServer: !process.env.CI },
});
