// @ts-check
const { defineConfig } = require('@playwright/test');
const { baseUrl } = require('./config/demoblaze');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 50 * 1000,
  reporter: [['html'], ['allure-playwright']],
  expect: {
    timeout: 20 * 1000,
  },
  use: {
    baseURL: baseUrl,
    headless: !!process.env.CI,
    trace: 'on-first-retry',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
    {
      name: 'msedge',
      use: {
        browserName: 'chromium',
        channel: 'msedge',
      },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
      },
    },
  ],
});
