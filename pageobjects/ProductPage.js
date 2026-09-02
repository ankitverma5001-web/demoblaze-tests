// Author - AnkitQA
const { expect } = require('@playwright/test');

class ProductPage {

    constructor(page) {
        this.page = page;
        this.title = page.locator('.name');
        this.price = page.locator('.price-container');
        this.addToCartButton = page.locator('.btn-success');
    }

    async navigate(productId) {
        await this.page.goto(`https://www.demoblaze.com/prod.html?idp_=${productId}`);
        await this.addToCartButton.waitFor({ state: 'visible' });
    }

    async verifyTitle(productName) {
        await expect(this.title).toHaveText(productName, { timeout: 15000 });
    }

    async addToCart() {
        const dialogPromise = this.page.waitForEvent('dialog', { timeout: 5000 }).catch(() => null);
        await this.addToCartButton.click();

        const dialog = await dialogPromise;
        if (dialog) {
            const message = dialog.message();
            await dialog.accept();
            return message;
        }
        return null;
    }
}
module.exports = ProductPage;
