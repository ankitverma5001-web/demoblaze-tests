---
name: demoblaze-domain
description: Domain knowledge for demoblaze.com (https://www.demoblaze.com) — the sole target of this repo. Selectors, flows, and dialog-handling quirks verified live via browser automation. Auto-loaded reference for create-scenarios/generate-tests/review-tests/test-strategy skills; not user-invocable.
disable-model-invocation: true
---

# demoblaze.com Domain Knowledge

Single target: **https://www.demoblaze.com/index.html** — a public e-commerce demo/practice site (phones, laptops, monitors). All facts below were verified live via browser automation, not assumed.

## Critical quirk: native `alert()` dialogs on signup/login/add-to-cart — but NOT on purchase

Signup, login, and add-to-cart all call the native `alert()`. Order placement (`purchaseOrder()`) does **not** — it shows a custom SweetAlert div (`.sweet-alert`, see Order modal section below) that must be waited for and dismissed via a normal click, not via Playwright's `dialog` event. Don't assume `purchaseOrder()` triggers a `dialog` event — it doesn't, and waiting for one will just time out. This has two consequences for the native-`alert()` cases (signup/login/add-to-cart):

1. **Manual/interactive browser automation** (e.g. driving a real Chrome session) will freeze/timeout on these actions unless `window.alert` is overridden *before* the triggering click, on every page load (the override resets on every navigation).
2. **Playwright tests** must register a `page.on('dialog', ...)` handler (or `page.once('dialog', ...)`) *before* triggering the action, and call `dialog.accept()` — Playwright auto-dismisses unhandled dialogs by default, which is fine for flows that don't need to read the message, but any test asserting on the alert text needs the handler in place first.

## Pages & selectors

### Home (`index.html`)
- Brand: `.navbar-brand` (contains a logo `<img>` plus the text "PRODUCT STORE" — use `toContainText`, not `toHaveText`, due to the image node)
- Nav: `#login2` (Log in), `#signin2` (Sign up), `#cartur` (Cart), `#logout2` (Log out, hidden until logged in), `#nameofuser` (Welcome text, hidden until logged in)
- Product cards link to `prod.html?idp_=<id>`; categories (Phones/Laptops/Monitors) are links, not yet mapped to a filtered API call

### Signup modal (triggered by `#signin2`)
- Fields: `#sign-username` (text), `#sign-password` (password)
- Submit function: `register()`
- Success: alert `"Sign up successful."`
- Duplicate username: alert `"This user already exist."`
- No email field, no password strength/format validation observed

### Login modal (triggered by `#login2`)
- Fields: `#loginusername` (text), `#loginpassword` (password)
- Submit function: `logIn()`
- Success: no reload — nav updates client-side, `#nameofuser` shows "Welcome `<username>`", `#logout2` becomes visible, `#login2`/`#signin2` hide
- Wrong password (valid username): alert `"Wrong password."`
- Non-existent username: not yet verified — don't assume the message, check live before asserting on it
- Logout: `#logout2` calls `logOut()`, reverts nav to logged-out state

### Product detail (`prod.html?idp_=<id>`)
- Product data loads asynchronously — the "Add to cart" button is not present immediately on navigation; wait for `.btn-success` ("Add to cart") rather than asserting instantly
- Add to cart: `.btn-success`, click → alert `"Product added."`. No visible cart-count badge anywhere in the nav (unlike SauceDemo) — the only way to verify the add is to check the cart page or the alert text

### Cart (`cart.html`)
- Also loads asynchronously — items may not appear in the DOM immediately after navigation
- Table columns: Pic / Title / Price / (Delete link, no header text — column header is literally "x")
- `Total` value updates automatically as items are added/removed
- Delete: a plain link inside the row's last cell, no confirmation dialog — removes immediately via AJAX
- "Place Order" button (`.btn-success`, text "Place Order") opens the order modal

### Order modal (`#orderModal`, opened via "Place Order")
- Fields: `#name`, `#country`, `#city`, `#card`, `#month`, `#year` — all plain text inputs, no date pickers or format masks
- **Only `#name` and `#card` are actually required** — Country/City/Month/Year can be left blank and the order still completes. This is a genuine, verified edge case worth testing explicitly (don't assume all 6 fields are required just because they're all present).
- Submit: "Purchase" button
- Missing name/card: alert `"Please fill out Name and Creditcard."` (native `alert()` — exact wording, note "Creditcard" is one word here, unlike the field label "Credit card:")
- Valid name+card (regardless of the other 4 fields): calls `purchaseOrder()`, which shows a **custom SweetAlert confirmation** (`.sweet-alert`, not a native dialog):
  - Heading (`.sweet-alert h2`): exactly `"Thank you for your purchase!"`
  - Body: `Id: <order id>`, `Amount: <total> USD`, `Card Number: <value entered>`, `Name: <value entered>`, `Date: <M/D/YYYY>`
  - Confirm button: `.sweet-alert button.confirm` — clicking it only closes the popup. **It does not redirect or refresh the current page.** The order is cleared server-side (confirmed: a fresh navigation to `cart.html` afterward shows 0 rows), but the current page's DOM keeps showing the now-stale cart row until you re-navigate. Verified with a standalone debug script — don't assert on a URL change after clicking confirm, and don't expect the current page's cart table to update itself; re-navigate to `cart.html` to check the cleared state.
  - In Playwright: `await page.locator('.sweet-alert').waitFor({ state: 'visible' })` after clicking Purchase, read `.sweet-alert h2` for the message, click `.sweet-alert button.confirm`, then `page.goto('cart.html')` again to verify it's empty — do **not** register a `page.on('dialog')` handler for this one, it will just time out waiting for an event that never fires

## Known gaps — verify before writing a scenario/test that depends on these
- Login with a non-existent username (message not yet verified)
- Category filter behavior (Phones/Laptops/Monitors links) — not yet explored
- Whether cart/checkout requires being logged in, or works anonymously (all testing so far was done logged in)
