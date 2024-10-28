// cypress/e2e/file_upload.cy.js

describe('File Upload Tests', () => {
  beforeEach(() => {
    // Visit the chat page before each test
    cy.visit('http://localhost:3000/chat');
    // Ensure localStorage is clear before each test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should upload an image file successfully and verify the uploaded file', () => {
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

    // Verify the uploaded file appears in the UI
    cy.get('div.uploaded-files').find('div.file-item').should('have.length', 1);
  });

  it('should upload a unsupported file and show a warning message', () => {
    // Interact with the upload button
    cy.get('input[type="file"]').should('exist');

    // Force show the hidden file input and upload the docx file
    const fileName = 'test.docx';
    cy.fixture(fileName, 'base64').then(fileContent => {
      cy.get('input[type="file"]').then(input => {
        const blob = Cypress.Blob.base64StringToBlob(fileContent, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        const file = new File([blob], fileName, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input[0].files = dataTransfer.files;
        input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    // Wait for 1000ms and verify the toast message appears
    cy.wait(1000);
    cy.get('div.p-toast-message').should('exist');
  });
});
