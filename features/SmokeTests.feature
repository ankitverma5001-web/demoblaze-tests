Feature: DemoBlaze smoke tests

Scenario: Successful signup and login
    Given user is on the demoblaze store
    When user signs up with a unique username and password "testpass123"
    Then the signup message should be "Sign up successful."
    When user logs in with the current credentials
    Then the login should succeed for the current user

Scenario: Duplicate signup is rejected
    Given user is on the demoblaze store
    When user signs up with username "duplicateuser_test_123" and password "testpass123"
    When user closes the signup dialog and tries the same signup again
    Then the duplicate signup message should be "This user already exist."

Scenario: Login with a wrong password
    Given user is on the demoblaze store
    When user logs in with username "testuser_existing" and password "wrongpass"
    Then the login message should be "Wrong password."

Scenario: Logout returns the navigation to its logged-out state
    Given user is on the demoblaze store
    When user signs up with a unique username and password "testpass123"
    When user logs in with the current credentials
    When user logs out
    Then the logged-out navigation should be visible

Scenario: Add a single product to the cart
    Given user is on the demoblaze store
    When user adds product "Samsung galaxy s6" to the cart from its product page
    Then the add-to-cart message should be "Product added"
    When user opens the cart
    Then the cart should contain product "Samsung galaxy s6"

Scenario: Add multiple products and verify the running total
    Given user is on the demoblaze store
    When user adds product "Samsung galaxy s6" to the cart from its product page
    When user adds product "Samsung galaxy s7" after returning to the store homepage
    When user opens the cart
    Then the cart should contain product "Samsung galaxy s6"
    Then the cart should contain product "Samsung galaxy s7"
    Then the cart total should be 1160

Scenario: Remove a product from the cart
    Given user is on the demoblaze store
    When user adds product "Samsung galaxy s6" to the cart from its product page
    When user opens the cart
    When user removes product "Samsung galaxy s6" from the cart
    Then the cart should be empty

Scenario: Purchase validation fails without name and card
    Given user is on the demoblaze store
    When user adds product "Samsung galaxy s6" to the cart from its product page
    When user opens the cart
    When user places an order without entering customer details
    Then the purchase validation message should be "Please fill out Name and Creditcard."

Scenario: Purchase succeeds with only required fields
    Given user is on the demoblaze store
    When user adds product "Samsung galaxy s6" to the cart from its product page
    When user opens the cart
    When user completes checkout with name "QA Tester" and card "4111111111111111"
    Then the order should succeed with message "Thank you for your purchase!"

Scenario: Purchase succeeds with all fields
    Given user is on the demoblaze store
    When user adds product "Nokia lumia 1520" to the cart from its product page
    When user opens the cart
    And user proceeds to checkout with name "John Automation", country "USA", city "San Francisco", card "4111111111111111", month "12" and year "2027"
    Then the purchase should complete successfully and the cart should be cleared