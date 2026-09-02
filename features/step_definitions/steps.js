// Author - AnkitQA
require('dotenv').config();
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const POManager = require('../../pageobjects/POManager');

// Verified live: idp_=1/2/3 map to these three catalog products (see demoblaze-domain skill).
const PRODUCT_IDS = {
    'Samsung galaxy s6': 1,
    'Nokia lumia 1520': 2,
    'Nexus 6': 3,
};

Given('user opens the demoblaze store', async function () {

    this.poManager = new POManager(this.page);
    await this.page.goto('https://www.demoblaze.com/index.html');
});

Then('the product store branding should be visible', async function () {

    await this.poManager.getHomePage().verifyLoaded();
});

Given('user logs in with valid demoblaze credentials', { timeout: 30 * 1000 }, async function () {

    this.poManager = new POManager(this.page);
    await this.poManager.getHomePage().navigate();
    await this.poManager.getHomePage().openLogin();
    const loginError = await this.poManager.getLoginPage().login(process.env.DEMOBLAZE_USERNAME, process.env.DEMOBLAZE_PASSWORD);
    expect(loginError, `Login failed unexpectedly: "${loginError}"`).toBeNull();
    await this.poManager.getHomePage().verifyLoggedInAs(process.env.DEMOBLAZE_USERNAME);
});

When('user adds product {string} to the cart', { timeout: 30 * 1000 }, async function (productName) {

    await this.poManager.getProductPage().navigate(PRODUCT_IDS[productName]);
    await this.poManager.getProductPage().verifyTitle(productName);
    this.lastAddMessage = await this.poManager.getProductPage().addToCart();
});

When('user opens the cart and verifies product {string} is present', { timeout: 30 * 1000 }, async function (productName) {

    await this.poManager.getCartPage().navigate();
    await this.poManager.getCartPage().verifyItemInCart(productName);
});

When('user proceeds to checkout with name {string}, country {string}, city {string}, card {string}, month {string} and year {string}', { timeout: 30 * 1000 }, async function (name, country, city, card, month, year) {

    await this.poManager.getCartPage().placeOrder();
    await this.poManager.getCheckoutPage().enterOrderDetails({ name, country, city, card, month, year });
    this.purchaseMessage = await this.poManager.getCheckoutPage().purchase();
});

Then('the purchase should complete successfully and the cart should be cleared', { timeout: 30 * 1000 }, async function () {

    expect(this.lastAddMessage).toBe('Product added.');
    expect(this.purchaseMessage).toBe('Thank you for your purchase!');

    // purchaseOrder() clears the cart server-side but does not redirect or
    // refresh the current page — re-navigate to see the cleared state.
    await this.poManager.getCartPage().navigate();
    await expect(this.poManager.getCartPage().rows).toHaveCount(0, { timeout: 15000 });
});
