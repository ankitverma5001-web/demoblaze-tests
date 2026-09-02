// Author - AnkitQA
class CheckoutPage {

    constructor(page) {
        this.page = page;
        this.name = page.locator('#name');
        this.country = page.locator('#country');
        this.city = page.locator('#city');
        this.card = page.locator('#card');
        this.month = page.locator('#month');
        this.year = page.locator('#year');
        this.purchaseButton = page.locator("button[onclick='purchaseOrder()']");
        this.confirmation = page.locator('.sweet-alert');
        this.confirmationHeading = page.locator('.sweet-alert h2');
        this.confirmButton = page.locator('.sweet-alert button.confirm');
    }

    async enterOrderDetails({ name, country = '', city = '', card, month = '', year = '' }) {
        await this.name.fill(name);
        await this.country.fill(country);
        await this.city.fill(city);
        await this.card.fill(card);
        await this.month.fill(month);
        await this.year.fill(year);
    }

    // purchaseOrder() shows a custom SweetAlert confirmation div (NOT a native
    // dialog) with the order Id/Amount/Card/Name/Date, then redirects to the
    // home page once its "OK" button is clicked. Verified live — see
    // demoblaze-domain skill for how this differs from signup/login/add-to-cart,
    // which do use native alert().
    async purchase() {
        await this.purchaseButton.click();
        await this.confirmation.waitFor({ state: 'visible', timeout: 15000 });
        const message = await this.confirmationHeading.textContent();
        await this.confirmButton.click();
        return message;
    }
}
module.exports = CheckoutPage;
