Feature: Login screen
  The mobile app should let a user submit login credentials from the UI.

  Scenario: Submit credentials from the login screen
    Given the login screen is open
    When I enter a username and password
    And I submit the login form
    Then the app should call the login service with those credentials
