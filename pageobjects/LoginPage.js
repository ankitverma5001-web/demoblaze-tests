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

        // Accept inside the event handler itself (not captured-then-accepted-later) -
        // with a mocked/instant network response the dialog can open and get
        // auto-dismissed by Playwright before a deferred accept() runs.
        let message = null;
        const dialogHandled = new Promise((resolve) => {
            this.page.once('dialog', async (dialog) => {
                message = dialog.message();
                await dialog.accept();
                resolve();
            });
        });

        await this.submitButton.click();
        await Promise.race([dialogHandled, this.page.waitForTimeout(this.dialogTimeout)]);
        return message;
    }
}
module.exports = LoginPage;
