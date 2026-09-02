Feature: DemoBlaze end-to-end purchase flow

Scenario: Login, add a product to cart, and complete checkout with valid details
    Given user logs in with valid demoblaze credentials
    When user adds product "Samsung galaxy s6" to the cart
    And user opens the cart and verifies product "Samsung galaxy s6" is present
    And user proceeds to checkout with name "QA Automation", country "India", city "Pune", card "4111111111111111", month "12" and year "2027"
    Then the purchase should complete successfully and the cart should be cleared
