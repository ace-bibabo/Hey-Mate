// cypress/e2e/chat.load.cy.js

describe('Chat Page Load Tests', () => {
  beforeEach(() => {
    // Visit the chat page before each test
    cy.visit('/chat');
  });

  it('should render the Greeting message successfully', () => {
    // Check if there is an h2 tag with the text "Welcome to the EA Assist"
    cy.get('h2').should('exist').and('contain.text', 'Welcome to the EA Assist');
  });

  it('should render the input box successfully', () => {
    // Check if there is a textarea with the placeholder "Type your message..."
    cy.get('textarea[placeholder="Type your message..."]').should('exist');
  });

  it('should render the toolbar buttons successfully', () => {
    // Check if there is a div with the class "main-tool-bar-misc"
    // and it contains 3 button elements
    cy.get('div.main-tool-bar-misc').should('exist').within(() => {
      cy.get('button').should('have.length', 3);
    });
  });
});
