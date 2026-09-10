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

    async purchase() {
        let dialogMessage;
        this.page.once('dialog', async (dialog) => {
            dialogMessage = dialog.message();
            await dialog.accept();
        });

        await this.purchaseButton.waitFor({ state: 'visible' });
        await this.purchaseButton.dispatchEvent('click');

        if (dialogMessage) {
            return { type: 'validation', message: dialogMessage };
        }

        // If no dialog, wait for SweetAlert confirmation
        await this.confirmation.waitFor({ state: 'visible', timeout: 15000 });
        const message = await this.confirmationHeading.textContent();
        await this.confirmButton.click();
        return { type: 'success', message };
    }
}
module.exports = CheckoutPage;
