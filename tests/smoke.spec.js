const { test } = require('@playwright/test');
const POManager = require('../pageobjects/POManager');

test('demoblaze home page loads', async ({ page }) => {

    const poManager = new POManager(page);
    await poManager.getHomePage().navigate();
    await poManager.getHomePage().verifyLoaded();
});
