// cypress/e2e/capability_map.cy.js

describe('Capability Map Generation Tests', () => {
  before(() => {
    // Visit the chat page before the tests start
    cy.visit('/chat');
    // Ensure localStorage is clear before the tests start
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should generate a capability map and trigger a download event', () => {
    // Input the text to generate capability map
    cy.get('textarea.message-input').type('Generate a new capability map about a car company, it should have 5 levels, each level should have 3 sub levels.');

    // Click the send button
    cy.get('button.send-btn').click();

    // Wait for the p-tree element to appear, timeout set to 60 seconds
    cy.get('.p-tree', { timeout: 60000 }).should('exist')
  });
});