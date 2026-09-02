// Author - AnkitQA
const { Before, After } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');

Before(async function () {
    // HEADED=true npx cucumber-js ... to watch the run in a real browser window.
    this.browser = await chromium.launch({ headless: !process.env.HEADED, slowMo: process.env.HEADED ? 250 : 0 });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
});

After(async function () {
    await this.page.close();
    await this.context.close();
    await this.browser.close();
});
