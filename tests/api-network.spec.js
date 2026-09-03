// Author - AnkitQA api
// Network-level tests: observe, mock, and fail the demoblaze REST API
// (https://api.demoblaze.com) instead of driving full UI flows.
// Endpoints/payload shapes below verified live against js/index.js, not assumed.
const { test, expect } = require('@playwright/test');
const POManager = require('../pageobjects/POManager');

const API_URL = 'https://api.demoblaze.com';

test.describe('API network interception', () => {

  test('GET /entries fires on home load and its item count matches the rendered cards', async ({ page }) => {
    const poManager = new POManager(page);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url() === `${API_URL}/entries` && res.request().method() === 'GET'),
      poManager.getHomePage().navigate(),
    ]);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.Items)).toBe(true);
    expect(body.Items.length).toBeGreaterThan(0);

    await expect(page.locator('#tbodyid .card')).toHaveCount(body.Items.length, { timeout: 15000 });
  });

  test('mocking /entries injects a product the real API never returned', async ({ page }) => {
    const mockedTitle = 'QA Mocked Phone XL';

    // Fulfilled entirely from the test (not proxied through the real, slow
    // live API) so the mock is instant and deterministic.
    await page.route(`${API_URL}/entries`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        Items: [{ id: 999999, title: mockedTitle, price: 1, desc: 'injected by test', cat: 'phone', img: 'imgs/galaxy_s6.jpg' }],
        LastEvaluatedKey: { id: 999999 },
      }),
    }));

    const poManager = new POManager(page);
    await poManager.getHomePage().navigate();

    await expect(page.locator('#tbodyid a.hrefch', { hasText: mockedTitle })).toBeVisible({ timeout: 15000 });
  });

  test('POST /login sends the password base64-encoded, never in plain text', async ({ page }) => {
    const username = 'network-intercept-user';
    const plainPassword = 'S3cretPass!';
    let capturedBody;

    await page.route(`${API_URL}/login`, async (route) => {
      capturedBody = route.request().postDataJSON();
      // Fulfilled from the test, not the real backend, so the assertion below
      // doesn't depend on a "network-intercept-user" account actually existing.
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ errorMessage: 'Wrong password.' }),
      });
    });

    const poManager = new POManager(page);
    await poManager.getHomePage().navigate();
    await poManager.getHomePage().openLogin();
    const alertMessage = await poManager.getLoginPage().login(username, plainPassword);

    expect(capturedBody.username).toBe(username);
    expect(capturedBody.password).not.toBe(plainPassword);
    expect(capturedBody.password).toBe(Buffer.from(plainPassword, 'utf-8').toString('base64'));
    expect(alertMessage).toBe('Wrong password.');
  });

  test('mocking a successful /login + /check flow logs the user in without a real backend account', async ({ page, context }) => {
    const username = 'mocked-user';
    const mockedToken = 'mocked-token-abc123';

    // Real success response body is the JSON-encoded string "Auth_token: <token>"
    // (not a JSON object) - front-end does data.replace("Auth_token: ", "").
    await page.route(`${API_URL}/login`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(`Auth_token: ${mockedToken}`),
    }));

    // On the post-login reload, index.js sends the cookie token to /check
    // and reads data.Item.username to render the "Welcome" banner.
    await page.route(`${API_URL}/check`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ Item: { username } }),
    }));

    const poManager = new POManager(page);
    await poManager.getHomePage().navigate();
    await poManager.getHomePage().openLogin();
    await poManager.getLoginPage().login(username, 'irrelevant-password');

    await poManager.getHomePage().verifyLoggedInAs(username);

    const tokenCookie = (await context.cookies()).find((c) => c.name === 'tokenp_');
    expect(tokenCookie?.value).toBe(mockedToken);
  });

  test('aborting /entries fails gracefully: nav stays usable, product list stays empty', async ({ page }) => {
    await page.route(`${API_URL}/entries`, (route) => route.abort('failed'));

    const poManager = new POManager(page);
    await poManager.getHomePage().navigate();
    await poManager.getHomePage().verifyLoaded();

    await expect(page.locator('#tbodyid .card')).toHaveCount(0);
    await expect(page.locator('#login2')).toBeVisible();
  });
});
