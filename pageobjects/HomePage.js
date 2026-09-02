// Author - AnkitQA
const { expect } = require('@playwright/test');

class HomePage {

    constructor(page) {
        this.page = page;
        this.brand = page.locator('.navbar-brand');
        this.loginLink = page.locator('#login2');
        this.signupLink = page.locator('#signin2');
        this.cartLink = page.locator('#cartur');
    }

    async navigate() {
        await this.page.goto('https://www.demoblaze.com/index.html');
    }

    async verifyLoaded() {
        await expect(this.brand).toContainText('PRODUCT STORE');
    }

    async openLogin() {
        await this.loginLink.click();
    }

    async openCart() {
        await this.cartLink.click();
    }

    async verifyLoggedInAs(username) {
        await expect(this.page.locator('#nameofuser')).toHaveText(`Welcome ${username}`, { timeout: 15000 });
        await expect(this.page.locator('#logout2')).toBeVisible();
    }
}
module.exports = HomePage;
