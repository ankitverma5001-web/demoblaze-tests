# DemoBlaze QA Test Plan

## Application Overview

DemoBlaze (https://demoblaze.com) is a public e-commerce demo site for phones, laptops, and monitors. It supports account signup/login, browsing products, adding items to a server-side cart, and placing an order through a modal checkout form. All flows below use native browser `alert()`/`confirm()` dialogs for feedback — see `demoblaze-domain` skill for the dialog-handling implications on automation.

## Test Scenarios

### 1. Account signup and login

**Seed:** `tests/smoke.spec.js`

#### 1.1. Successful signup with a new username

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. Open the Sign up modal and enter a username that does not already exist, plus a password
    - expect: Submitting shows the alert "Sign up successful."
  2. Log in with the same username/password just created
    - expect: The nav updates to show "Welcome `<username>`" and a Log out link, without a page reload.

#### 1.2. Signup with a duplicate username

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. Open the Sign up modal and enter a username that already has an account
    - expect: Submitting shows the alert "This user already exist."
  2. Confirm no new/duplicate account was created by logging in with the original account's password
    - expect: Login succeeds normally with the original credentials.

#### 1.3. Login with a wrong password

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. Open the Login modal with a valid, existing username but an incorrect password
    - expect: Submitting shows the alert "Wrong password."
  2. Retry with the correct password
    - expect: Login succeeds and the nav reflects the logged-in state.

#### 1.4. Logout returns the nav to its logged-out state

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. While logged in, click the Log out link
    - expect: The nav reverts to showing Log in / Sign up links, and the "Welcome `<username>`" text and Log out link are hidden again.

### 2. Product browsing and cart

**Seed:** `tests/smoke.spec.js`

#### 2.1. Add a single product to the cart

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. Open a product's detail page and click "Add to cart" once the button is present (product data loads asynchronously)
    - expect: The alert "Product added." appears.
  2. Navigate to the cart page
    - expect: The product's title and price appear in the cart table, and Total matches the product's price.

#### 2.2. Add multiple products and verify the running total

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. Add two different products to the cart from their respective detail pages
    - expect: Each triggers its own "Product added." alert.
  2. Open the cart
    - expect: Both products appear as separate rows, and Total equals the sum of both prices.

#### 2.3. Remove an item from the cart

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. With at least one item in the cart, click its Delete link
    - expect: The row disappears immediately (no confirmation dialog) and Total updates to reflect the remaining items.
  2. Delete the last remaining item
    - expect: The cart table is empty and Total shows no value.

### 3. Checkout / order placement

**Seed:** `tests/smoke.spec.js`

#### 3.1. Purchase fails validation when Name and Credit card are empty

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. With an item in the cart, open "Place Order" and click "Purchase" without filling any fields
    - expect: The alert "Please fill out Name and Creditcard." appears, and the order modal remains open with the cart unchanged.

#### 3.2. Purchase succeeds with only Name and Credit card filled (edge case)

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. With an item in the cart, open "Place Order", fill in only Name and Credit card, and leave Country, City, Month, and Year blank
    - expect: The purchase completes — a confirmation panel (a custom `.sweet-alert` element, not a native dialog) shows "Thank you for your purchase!" with the order Id/Amount/Card Number/Name/Date. Clicking its OK button only closes the panel — it does not redirect or refresh the page.
  2. Re-navigate to the cart page (a fresh load, not just checking the current page)
    - expect: The cart is empty — the order clears it server-side, confirming Country/City/Month/Year are not actually required despite being present in the form.

#### 3.3. Purchase succeeds with all fields filled (happy path)

**File:** `specs/DemoBlaze-Test-Plan.md`

**Steps:**
  1. With an item in the cart, open "Place Order" and fill in all six fields (Name, Country, City, Credit card, Month, Year) with valid-looking values
    - expect: The purchase completes the same way as 3.2 — the "Thank you for your purchase!" confirmation panel appears and the cart is cleared server-side once dismissed.

## Not yet covered — needs live verification before scenarios can be written

- Category filter links (Phones/Laptops/Monitors) — behavior not yet explored
- Whether browsing/cart/checkout require being logged in, or work anonymously
- Login with a username that doesn't exist at all (distinct from "wrong password")

### 4. API & Network Layer

**Seed:** `tests/api-network.spec.js`

#### 4.1. GET /entries returns the product catalog

**File:** `tests/api-network.spec.js`

**Steps:**
  1. Navigate to the home page and intercept the GET `/entries` API call
    - expect: Response status is 200 with `Content-Type: application/json`
  2. Parse the JSON response body
    - expect: Response contains an `Items` array with products (each having `id`, `title`, `price`, `desc`, `cat`, `img`)
  3. Count the rendered product cards on the page
    - expect: Card count matches the length of `Items` array in the API response

#### 4.2. POST /login encodes password in base64 (security check)

**File:** `tests/api-network.spec.js`

**Steps:**
  1. Open the Login modal and intercept the POST `/login` request
  2. Enter username `user` and password `pass123` (plain text in UI)
    - expect: The intercepted request body contains password base64-encoded, never in plain text
    - expect: The request succeeds with 200 status and returns an auth token

#### 4.3. POST /login with invalid credentials returns error

**File:** `tests/api-network.spec.js`

**Steps:**
  1. Intercept POST `/login` with invalid username/password
    - expect: Response status is 400 (Bad Request) or 401 (Unauthorized)
  2. Attempt the failed login via UI
    - expect: An error alert is shown (e.g., "Wrong password." or user not found)

#### 4.4. Mocking /entries injects test data (network override)

**File:** `tests/api-network.spec.js`

**Steps:**
  1. Use `page.route()` to mock the GET `/entries` response with custom product data (e.g., a product with title "QA Mocked Phone XL")
  2. Navigate to home page
    - expect: The injected product appears in the product list on the page, proving the mock was applied

#### 4.5. Aborting /entries fails the page load (network error simulation)

**File:** `tests/api-network.spec.js`

**Steps:**
  1. Use `page.route()` to abort the GET `/entries` request (e.g., `route.abort('failed')`)
  2. Attempt to navigate to home page
    - expect: The page fails to load products (no cards rendered or error state displayed)

#### 4.6. POST /check validates an active session

**File:** `tests/api-network.spec.js`

**Steps:**
  1. Log in via the UI and intercept the POST `/check` request
    - expect: Response status is 200, confirming the session is valid
  2. Use an invalid or expired auth token in a POST `/check` call
    - expect: Response status is 401 or 403, indicating unauthorized/session expired

#### 4.7. POST /addtocart requires authentication

**File:** `tests/api-network.spec.js`

**Steps:**
  1. Intercept the POST `/addtocart` request from a logged-in user adding an item to cart
    - expect: Request includes auth token, response status is 200, item is added successfully
  2. Attempt POST `/addtocart` without a valid token
    - expect: Response status is 401, cart item is not added
