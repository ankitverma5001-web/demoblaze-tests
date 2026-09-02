// Author - AnkitQA
const HomePage = require('./HomePage');
const LoginPage = require('./LoginPage');
const ProductPage = require('./ProductPage');
const CartPage = require('./CartPage');
const CheckoutPage = require('./CheckoutPage');

class POManager {

    constructor(page) {
        this.page = page;
        this.homePage = new HomePage(page);
        this.loginPage = new LoginPage(page);
        this.productPage = new ProductPage(page);
        this.cartPage = new CartPage(page);
        this.checkoutPage = new CheckoutPage(page);
    }

    getHomePage() {
        return this.homePage;
    }

    getLoginPage() {
        return this.loginPage;
    }

    getProductPage() {
        return this.productPage;
    }

    getCartPage() {
        return this.cartPage;
    }

    getCheckoutPage() {
        return this.checkoutPage;
    }
}
module.exports = POManager;
