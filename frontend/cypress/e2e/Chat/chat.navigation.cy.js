// cypress/e2e/navigation.cy.js

describe('Navigation Tests', () => {
  beforeEach(() => {
    // Visit the chat page before each test
    cy.visit('/chat');
  });

  it('should navigate to Admin Panel when the button is clicked', () => {
    // Click the button that navigates to the Admin Panel
    cy.get('button.navigation-to-admin').click();

    // Verify the URL is changed to /admin
    cy.url().should('include', '/admin');
  });
});
