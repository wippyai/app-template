import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'

/**
 * The MANAGED-mode pass. Run with `pnpm test:e2e:managed`.
 *
 * Separate from `playwright.config.ts` because managed and compat boots
 * are mutually exclusive — one wippy instance, one shared `app.db` — so
 * the two suites cannot share a run. The default config `testIgnore`s
 * this spec, and `testIgnore` wins even when the file is named
 * explicitly on the command line, so a second config is the only way to
 * target it.
 *
 * Launch the app for this pass with:
 *
 *   ./wippy.exe run -c \
 *     -o wippy.facade:fe_facade_url:default=http://localhost:5173 \
 *     -o wippy.facade:fe_mode:default=managed
 *
 * The layout declaration itself is committed as `host_config_layout` in
 * `src/app/deps/_index.yaml` and is inert under the default compat mode.
 */
const WIPPY_URL = process.env.WIPPY_URL || 'http://localhost:8080'

export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/managed-layout.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: WIPPY_URL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
