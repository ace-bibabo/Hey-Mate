// cypress/e2e/bpmn_rendering.cy.js

describe('BPMN Rendering Tests', () => {
  beforeEach(() => {
    // Visit the chat page before each test
    cy.visit('/chat');
    // Ensure localStorage is clear before each test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should upload an image and convert it to a BPMN diagram', () => {
    // Interact with the upload button
    cy.get('input[type="file"]').should('exist');

    // Force show the hidden file input and upload the image file
    const fileName = 'logical_dataflow.png';
    cy.fixture(fileName, 'base64').then(fileContent => {
      cy.get('input[type="file"]').then(input => {
        const blob = Cypress.Blob.base64StringToBlob(fileContent, 'image/png');
        const file = new File([blob], fileName, { type: 'image/png' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input[0].files = dataTransfer.files;
        input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    // Enter text to convert image to BPMN diagram
    cy.get('textarea.message-input').type('Convert this image to a BPMN diagram');

    // Click the send button
    cy.get('button.send-btn').click();

    // Wait for the bpmn-canvas element to appear, timeout set to 90 seconds
    cy.get('div.bpmn-canvas', { timeout: 90000 }).should('exist');
  });
});
