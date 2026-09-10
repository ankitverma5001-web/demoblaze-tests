// Author - AnkitQA
const { expect } = require('@playwright/test');

class CartPage {

    constructor(page) {
        this.page = page;
        this.rows = page.locator('#tbodyid tr');
        this.total = page.locator('#totalp');
        this.placeOrderButton = page.locator('button.btn-success[data-target="#orderModal"]');
    }

    async navigate() {
        await this.page.goto('https://www.demoblaze.com/cart.html');
    }

    async verifyItemInCart(productName) {
        await expect(this.rows.filter({ hasText: productName })).toHaveCount(1, { timeout: 15000 });
    }

    async verifyTotal(amount) {
        await expect(this.total).toHaveText(String(amount), { timeout: 15000 });
    }

    async placeOrder() {
        await this.placeOrderButton.click();
    }

    async deleteItem(productName) {
        const row = this.rows.filter({ hasText: productName });
        const deleteLink = row.locator('a:has-text("Delete")');
        await deleteLink.click();
        await this.page.waitForTimeout(500); // Wait for AJAX to complete
    }

    async verifyCartEmpty() {
        await expect(this.rows).toHaveCount(0);
    }
}
module.exports = CartPage;
