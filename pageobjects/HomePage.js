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

    async openSignup() {
        await this.signupLink.click();
    }

    async logout() {
        await this.page.locator('#logout2').click();
    }

    async verifyLoggedInAs(username) {
        await expect(this.page.locator('#nameofuser')).toHaveText(`Welcome ${username}`, { timeout: 15000 });
        await expect(this.page.locator('#logout2')).toBeVisible();
    }

    async verifyLoggedOut() {
        await expect(this.loginLink).toBeVisible();
        await expect(this.signupLink).toBeVisible();
        await expect(this.page.locator('#logout2')).not.toBeVisible();
        await expect(this.page.locator('#nameofuser')).not.toBeVisible();
    }
}
module.exports = HomePage;
