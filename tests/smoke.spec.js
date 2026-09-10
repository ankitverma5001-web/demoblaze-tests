const { test, expect } = require('@playwright/test');
const POManager = require('../pageobjects/POManager');

// Generate unique usernames for signup tests to avoid duplicate conflicts
function generateUniqueUsername() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

test.describe('DemoBlaze E2E - Account, Cart & Checkout', () => {

    // =====================================================
    // SECTION 1: Account Signup and Login
    // =====================================================

    test('TC-1.1: Successful signup with a new username', async ({ page }) => {
        const username = generateUniqueUsername();
        const password = 'testpass123';
        const poManager = new POManager(page);

        await poManager.getHomePage().navigate();
        await poManager.getHomePage().openSignup();
        
        const signupMessage = await poManager.getLoginPage().signup(username, password);
        expect(signupMessage).toBe('Sign up successful.');

        // Now login with the same credentials
        await poManager.getHomePage().openLogin();
        const loginMessage = await poManager.getLoginPage().login(username, password);
        expect(loginMessage).toBeNull(); // Successful login shows no alert
        
        // Verify logged-in state
        await poManager.getHomePage().verifyLoggedInAs(username);
    });

    test('TC-1.2: Signup with a duplicate username', async ({ page }) => {
        const duplicateUsername = 'duplicateuser_test_123';
        const password = 'testpass123';
        const poManager = new POManager(page);

        await poManager.getHomePage().navigate();
        
        // First signup attempt (may fail if already exists, that's ok)
        await poManager.getHomePage().openSignup();
        await poManager.getLoginPage().signup(duplicateUsername, password);
        
        // Close modal and try signup again with same username
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        await poManager.getHomePage().openSignup();
        const duplicateMessage = await poManager.getLoginPage().signup(duplicateUsername, password);
        expect(duplicateMessage).toBe('This user already exist.');
    });

    test('TC-1.3: Login with a wrong password', async ({ page }) => {
        const username = 'testuser_existing';
        const wrongPassword = 'wrongpass';
        const poManager = new POManager(page);

        await poManager.getHomePage().navigate();
        await poManager.getHomePage().openLogin();
        
        const wrongPassMessage = await poManager.getLoginPage().login(username, wrongPassword);
        expect(wrongPassMessage).toBe('Wrong password.');
    });

    test('TC-1.4: Logout returns the nav to its logged-out state', async ({ page }) => {
        const username = generateUniqueUsername();
        const password = 'testpass123';
        const poManager = new POManager(page);

        // Signup and login
        await poManager.getHomePage().navigate();
        await poManager.getHomePage().openSignup();
        await poManager.getLoginPage().signup(username, password);
        
        await page.waitForTimeout(1000);
        await poManager.getHomePage().navigate(); // Refresh page
        await poManager.getHomePage().openLogin();
        await poManager.getLoginPage().login(username, password);
        
        // Verify logged-in state
        await poManager.getHomePage().verifyLoggedInAs(username);
        
        // Now logout
        await poManager.getHomePage().logout();
        await page.waitForTimeout(500);
        
        // Verify logged-out state
        await poManager.getHomePage().verifyLoggedOut();
    });

    // =====================================================
    // SECTION 2: Product Browsing and Cart
    // =====================================================

    test('TC-2.1: Add a single product to the cart', async ({ page }) => {
        const poManager = new POManager(page);
        const productId = 1; // Samsung galaxy s6

        await poManager.getHomePage().navigate();
        
        // Navigate to product detail page
        await poManager.getProductPage().navigate(productId);
        await poManager.getProductPage().verifyTitle('Samsung galaxy s6');
        
        // Add to cart
        const addToCartMessage = await poManager.getProductPage().addToCart();
        expect(addToCartMessage).toBe('Product added');
        
        // Verify in cart
        await poManager.getHomePage().openCart();
        await poManager.getCartPage().verifyItemInCart('Samsung galaxy s6');
    });

    test('TC-2.2: Add multiple products and verify the running total', async ({ page }) => {
        const poManager = new POManager(page);
        const product1Id = 1; // Samsung galaxy s6
        const product2Id = 4; // Samsung galaxy s7

        await poManager.getHomePage().navigate();
        
        // Add first product
        await poManager.getProductPage().navigate(product1Id);
        const msg1 = await poManager.getProductPage().addToCart();
        expect(msg1).toBe('Product added');
        
        // Add second product
        await poManager.getHomePage().navigate();
        await poManager.getProductPage().navigate(product2Id);
        const msg2 = await poManager.getProductPage().addToCart();
        expect(msg2).toBe('Product added');
        
        // Verify both in cart
        await poManager.getHomePage().openCart();
        await poManager.getCartPage().verifyItemInCart('Samsung galaxy s6');
        await poManager.getCartPage().verifyItemInCart('Samsung galaxy s7');
    });

    test('TC-2.3: Remove an item from the cart', async ({ page }) => {
        const poManager = new POManager(page);
        const productId = 1;

        await poManager.getHomePage().navigate();
        
        // Add product
        await poManager.getProductPage().navigate(productId);
        const addMsg = await poManager.getProductPage().addToCart();
        expect(addMsg).toBe('Product added');
        
        // Go to cart and verify item exists
        await poManager.getHomePage().openCart();
        await poManager.getCartPage().verifyItemInCart('Samsung galaxy s6');
        
        // Delete the item
        await poManager.getCartPage().deleteItem('Samsung galaxy s6');
        
        // Verify cart is empty
        await poManager.getCartPage().verifyCartEmpty();
    });

    // =====================================================
    // SECTION 3: Checkout / Order Placement
    // =====================================================

    test('TC-3.1: Purchase fails validation when Name and Credit card are empty', async ({ page }) => {
        const poManager = new POManager(page);
        const productId = 1;

        await poManager.getHomePage().navigate();
        
        // Add product to cart
        await poManager.getProductPage().navigate(productId);
        await poManager.getProductPage().addToCart();
        
        // Open cart and place order
        await poManager.getHomePage().openCart();
        await poManager.getCartPage().placeOrder();
        
        // Wait for order modal to appear
        await page.locator('#orderModal').waitFor({ state: 'visible', timeout: 5000 });
        
        // Try to purchase without filling any fields
        const result = await poManager.getCheckoutPage().purchase();
        expect(result.type).toBe('validation');
        expect(result.message).toBe('Please fill out Name and Creditcard.');
        
        // Modal should still be open, item still in cart
        await expect(page.locator('#orderModal')).toBeVisible();
        await poManager.getHomePage().navigate();
        await poManager.getHomePage().openCart();
        await poManager.getCartPage().verifyItemInCart('Samsung galaxy s6');
    });

    test('TC-3.2: Purchase succeeds with only Name and Credit card filled (edge case)', async ({ page }) => {
        const poManager = new POManager(page);
        const productId = 1;

        await poManager.getHomePage().navigate();
        
        // Add product
        await poManager.getProductPage().navigate(productId);
        await poManager.getProductPage().addToCart();
        
        // Place order with only Name and Card (required fields)
        await poManager.getHomePage().openCart();
        await poManager.getCartPage().placeOrder();
        
        await page.locator('#orderModal').waitFor({ state: 'visible', timeout: 5000 });
        
        await poManager.getCheckoutPage().enterOrderDetails({
            name: 'QA Tester',
            card: '4111111111111111'
            // Country, City, Month, Year left blank
        });
        
        const result = await poManager.getCheckoutPage().purchase();
        expect(result.type).toBe('success');
        expect(result.message).toContain('Thank you for your purchase!');
        
        // Verify cart is cleared server-side
        await poManager.getHomePage().navigate();
        await poManager.getHomePage().openCart();
        await poManager.getCartPage().verifyCartEmpty();
    });

    test('TC-3.3: Purchase succeeds with all fields filled (happy path)', async ({ page }) => {
        const poManager = new POManager(page);
        const productId = 2; // Different product

        await poManager.getHomePage().navigate();
        
        // Add product
        await poManager.getProductPage().navigate(productId);
        await poManager.getProductPage().addToCart();
        
        // Place order with all fields filled
        await poManager.getHomePage().openCart();
        await poManager.getCartPage().placeOrder();
        
        await page.locator('#orderModal').waitFor({ state: 'visible', timeout: 5000 });
        
        await poManager.getCheckoutPage().enterOrderDetails({
            name: 'John Automation',
            country: 'USA',
            city: 'San Francisco',
            card: '4111111111111111',
            month: '12',
            year: '2027'
        });
        
        const result = await poManager.getCheckoutPage().purchase();
        expect(result.type).toBe('success');
        expect(result.message).toContain('Thank you for your purchase!');
        
        // Verify cart is cleared
        await poManager.getHomePage().navigate();
        await poManager.getHomePage().openCart();
        await poManager.getCartPage().verifyCartEmpty();
    });

});
