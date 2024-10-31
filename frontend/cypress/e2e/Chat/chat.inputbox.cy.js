// cypress/e2e/dialog.cy.js

describe('Input Box Tests', () => {
  beforeEach(() => {
    // Visit the chat page before each test
    cy.visit('/chat');
    // Ensure localStorage is clear before each test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should disable the send button when the input is empty', () => {
    // Verify the send button is disabled when the input is empty
    cy.get('textarea.message-input').should('have.value', '');
    cy.get('button.send-btn').should('be.disabled');
  });

  it('should allow the user to input data', () => {
    // Input data into the textarea
    cy.get('textarea.message-input').type('Test Message');
    // Verify the textarea contains the input data
    cy.get('textarea.message-input').should('have.value', 'Test Message');
  });

  it('should enable the send button when there is input data', () => {
    // Input data into the textarea
    cy.get('textarea.message-input').type('Test Message');
    // Verify the send button is enabled when there is input data
    cy.get('button.send-btn').should('not.be.disabled');
  });

  it('should store data in localStorage when the send button is clicked', () => {
    // Input data into the textarea
    cy.get('textarea.message-input').type('Test Message');
    // Click the send button
    cy.get('button.send-btn').click();
    // Wait for localStorage to be updated
    cy.wait(500);
    // Verify the localStorage contains the correct data
    cy.window().then((win) => {
      const storedMessages = JSON.parse(win.localStorage.getItem('chatMessages'));
      expect(storedMessages).to.be.an('array').that.is.not.empty;
      expect(storedMessages[0]).to.deep.equal({
        content: 'Test Message',
        isUser: true,
        type: 'text'
      });
    });
  });
});
