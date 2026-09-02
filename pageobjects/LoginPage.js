// Author - AnkitQA
const { expect } = require('@playwright/test');

class LoginPage {

    constructor(page) {
        this.page = page;
        this.username = page.locator('#loginusername');
        this.password = page.locator('#loginpassword');
        this.submitButton = page.locator("button[onclick='logIn()']");
        this.dialogTimeout = 1500;
    }

    async login(username, password) {
        await this.username.fill(username);
        await this.password.fill(password);

        const dialogPromise = this.page.waitForEvent('dialog', { timeout: this.dialogTimeout }).catch(() => null);
        await this.submitButton.click();

        const dialog = await dialogPromise;
        if (dialog) {
            const message = dialog.message();
            await dialog.accept();
            return message;
        }
        return null;
    }
}
module.exports = LoginPage;
