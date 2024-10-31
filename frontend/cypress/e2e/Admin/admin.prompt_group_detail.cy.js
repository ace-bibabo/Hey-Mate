// cypress/e2e/prompt_group_detail.cy.js

describe('Prompt Group Detail Tests', () => {
  it('should add new prompts and interact with them', () => {
    // Visit the admin page
    cy.visit('/admin');
    // Clear localStorage
    cy.window().then((win) => {
      win.localStorage.clear();
    });

    // Wait for 500ms to ensure data is loaded
    cy.wait(500);

    // Click the new prompt button
    cy.get('button.new-prompt').click();

    cy.wait(500);

    // Click the add new prompt button again to add another single prompt
    cy.get('button.add-new-prompt').click();

    cy.wait(500);

    cy.get('button.add-new-prompt').click();

    // Wait for the list to update and verify there are two elements
    cy.get('div.prompts-list div.p-listbox-list-wrapper ul.p-listbox-list').find('li').should('have.length', 2);

    // Select and click the last prompt (last element)
    cy.get('div.prompts-list div.p-listbox-list-wrapper ul.p-listbox-list').find('li').last().click();

    // Modify the content of the input field with id 'prompt-name'
    cy.get('#prompt-name').clear().type('TestPrompt');

    // Modify the content of the textarea with id 'prompt-text'
    cy.get('#prompt-text').clear().type('TestDesc');

    // Click the confirm modify prompt button
    cy.get('button.confirm-modify-prompt').click();

    cy.wait(500)

    // Click the button with class 'prompt-item-right' inside the last 'li' element
    cy.get('div.prompts-list div.p-listbox-list-wrapper ul.p-listbox-list')
      .find('li')
      .last()
      .find('div.prompt-list-item')
      .find('button.prompt-item-right')
      .click();

    cy.wait(500)

    // Click the button with class 'set-default-prompt'
    cy.get('button.set-default-prompt').click();

    cy.wait(500);

    cy.reload()

    cy.wait(500);

    cy.get('div.sidebar-list div.p-listbox-list-wrapper ul.p-listbox-list').find('li').last().click();

    cy.wait(500);

    // Verify the text of the span inside the default prompt is 'TestPrompt'
    cy.get('div.default span.prompt-item-left').should('have.text', 'TestPrompt');

    // Verify the prompt-item-left contains an i element with class 'pi-star'
    cy.get('div.default i.pi-star').should('exist');

    cy.get('button.delete-prompt').click();

    cy.wait(500);

    cy.get('button.delete-prompt').click();

    cy.wait(500);

    cy.get('div.sidebar-list div.p-listbox-list-wrapper ul.p-listbox-list')
      .find('li')
      .last()
      .find('div.admin-list-box-item button.admin-item-right')
      .click();

    cy.wait(500);

    cy.get('button.sidebar-delete').click();

    cy.wait(500);

    cy.get('div.p-dialog-footer button.p-button-danger').click();
  });
});
