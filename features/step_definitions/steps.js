// Author - AnkitQA
require('dotenv').config();
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const POManager = require('../../pageobjects/POManager');
const { buildStoreUrl } = require('../../config/demoblaze');

// Verified live product IDs used by the smoke scenarios.
const PRODUCT_IDS = {
    'Samsung galaxy s6': 1,
    'Nokia lumia 1520': 2,
    'Nexus 6': 3,
    'Samsung galaxy s7': 4,
};

Given('user opens the demoblaze store', async function () {

    this.poManager = new POManager(this.page);
    await this.page.goto(buildStoreUrl('/index.html'));
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

    expect(this.lastAddMessage).toBe('Product added');
    expect(this.purchaseMessage.type).toBe('success');
    expect(this.purchaseMessage.message).toContain('Thank you for your purchase!');

    // purchaseOrder() clears the cart server-side but does not redirect or
    // refresh the current page — re-navigate to see the cleared state.
    await this.poManager.getCartPage().navigate();
    await expect(this.poManager.getCartPage().rows).toHaveCount(0, { timeout: 15000 });
});

Given('user is on the demoblaze store', { timeout: 30 * 1000 }, async function () {
    this.poManager = new POManager(this.page);
    await this.poManager.getHomePage().navigate();
});

When('user signs up with a unique username and password {string}', async function (password) {
    this.username = `bdd_user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.password = password;
    await this.poManager.getHomePage().openSignup();
    this.signupMessage = await this.poManager.getLoginPage().signup(this.username, this.password);
});

When('user logs in with the current credentials', async function () {
    await this.poManager.getHomePage().openLogin();
    this.loginMessage = await this.poManager.getLoginPage().login(this.username, this.password);
});

Then('the signup message should be {string}', function (message) {
    expect(this.signupMessage).toBe(message);
});

Then('the login should succeed for the current user', async function () {
    expect(this.loginMessage).toBeNull();
    await this.poManager.getHomePage().verifyLoggedInAs(this.username);
});

When('user signs up with username {string} and password {string}', async function (username, password) {
    this.poManager = this.poManager || new POManager(this.page);
    this.username = username;
    this.password = password;
    await this.poManager.getHomePage().openSignup();
    this.signupMessage = await this.poManager.getLoginPage().signup(username, password);
});

When('user closes the signup dialog and tries the same signup again', async function () {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(500);
    await this.poManager.getHomePage().openSignup();
    this.duplicateSignupMessage = await this.poManager.getLoginPage().signup(this.username, this.password);
});

Then('the duplicate signup message should be {string}', function (message) {
    expect(this.duplicateSignupMessage).toBe(message);
});

When('user logs in with username {string} and password {string}', async function (username, password) {
    await this.poManager.getHomePage().openLogin();
    this.loginMessage = await this.poManager.getLoginPage().login(username, password);
});

Then('the login message should be {string}', function (message) {
    expect(this.loginMessage).toBe(message);
});

When('user logs out', async function () {
    await this.poManager.getHomePage().logout();
});

Then('the logged-out navigation should be visible', async function () {
    await this.poManager.getHomePage().verifyLoggedOut();
});

When('user adds product {string} to the cart from its product page', async function (productName) {
    await this.poManager.getProductPage().navigate(PRODUCT_IDS[productName]);
    await this.poManager.getProductPage().verifyTitle(productName);
    this.lastAddMessage = await this.poManager.getProductPage().addToCart();
});

Then('the add-to-cart message should be {string}', function (message) {
    expect(this.lastAddMessage).toBe(message);
});

When('user opens the cart', async function () {
    await this.poManager.getHomePage().openCart();
});

Then('the cart should contain product {string}', { timeout: 30 * 1000 }, async function (productName) {
    await this.poManager.getCartPage().verifyItemInCart(productName);
});

When('user adds product {string} after returning to the store homepage', async function (productName) {
    await this.poManager.getHomePage().navigate();
    await this.poManager.getProductPage().navigate(PRODUCT_IDS[productName]);
    this.lastAddMessage = await this.poManager.getProductPage().addToCart();
});

Then('the cart total should be {int}', { timeout: 30 * 1000 }, async function (amount) {
    await this.poManager.getCartPage().verifyTotal(amount);
});

When('user removes product {string} from the cart', async function (productName) {
    await this.poManager.getCartPage().deleteItem(productName);
});

Then('the cart should be empty', { timeout: 30 * 1000 }, async function () {
    await this.poManager.getCartPage().verifyCartEmpty();
});

When('user places an order without entering customer details', async function () {
    await this.poManager.getCartPage().placeOrder();
    await this.page.locator('#orderModal').waitFor({ state: 'visible', timeout: 5000 });
    this.purchaseMessage = await this.poManager.getCheckoutPage().purchase();
});

Then('the purchase validation message should be {string}', function (message) {
    expect(this.purchaseMessage.type).toBe('validation');
    expect(this.purchaseMessage.message).toBe(message);
});

When('user completes checkout with name {string} and card {string}', async function (name, card) {
    await this.poManager.getCartPage().placeOrder();
    await this.page.locator('#orderModal').waitFor({ state: 'visible', timeout: 5000 });
    await this.poManager.getCheckoutPage().enterOrderDetails({ name, card });
    this.purchaseMessage = await this.poManager.getCheckoutPage().purchase();
});

Then('the order should succeed with message {string}', async function (message) {
    expect(this.purchaseMessage.type).toBe('success');
    expect(this.purchaseMessage.message).toContain(message);
    await this.poManager.getCartPage().navigate();
    await this.poManager.getCartPage().verifyCartEmpty();
});
