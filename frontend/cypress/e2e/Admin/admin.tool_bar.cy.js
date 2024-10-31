// cypress/e2e/admin_tests.cy.js

describe('Admin Page Tests', () => {
  it('should add a new prompt and increase the list count', () => {
    // Visit the admin page
    cy.visit('/admin');
    // Clear localStorage
    cy.window().then((win) => {
      win.localStorage.clear();
    });

    cy.wait(1000)

    // Get the initial count of list items
    cy.get('ul.p-listbox-list').find('li').then((initialItems) => {
      const initialCount = initialItems.length;

      // Click the new prompt button
      cy.get('button.new-prompt').click();

      cy.wait(500)

      // Wait for the list to update and verify the count has increased by 1
      cy.get('ul.p-listbox-list').find('li').should('have.length', initialCount + 1);
    });
  });

  it('should navigate to chat page when navigate button is clicked', () => {
    // Visit the admin page
    cy.visit('/admin');
    // Clear localStorage
    cy.window().then((win) => {
      win.localStorage.clear();
    });

    // Click the navigate-to-chat button
    cy.get('button.navigate-to-chat').click();

    // Verify the URL has changed to /chat
    cy.url().should('include', '/chat');

    // Verify the chat page has loaded by checking for a specific element on the chat page
    cy.get('textarea.message-input').should('exist');
  });

  it('should toggle the sidebar collapse state', () => {
    // Visit the admin page
    cy.visit('/admin');
    // Clear localStorage
    cy.window().then((win) => {
      win.localStorage.clear();
    });

    // Ensure the sidebar is initially expanded
    cy.get('div.sidebar').should('not.have.class', 'collapsed');

    // Click the toggle-collapse button to collapse the sidebar
    cy.get('button.toggle-collapse').click();

    // Verify the sidebar has the collapsed class and width is 80px
    cy.get('div.sidebar').should('have.class', 'collapsed');
    cy.get('div.sidebar').should('have.css', 'width', '80px');

    // Click the toggle-collapse button again to expand the sidebar
    cy.get('button.toggle-collapse').click();

    // Verify the sidebar does not have the collapsed class and width is 250px
    cy.get('div.sidebar').should('not.have.class', 'collapsed');
    cy.get('div.sidebar').should('have.css', 'width', '250px');
  });

  it('should toggle the theme and update localStorage', () => {
    // Visit the admin page
    cy.visit('/admin');
    // Clear localStorage
    cy.window().then((win) => {
      win.localStorage.clear();
    });

    // Set the initial theme to light
    cy.window().then((win) => {
      win.localStorage.setItem('theme', 'light');
    });
    cy.reload();

    // Verify the light theme CSS file is loaded
    cy.get('link[rel="stylesheet"]').should('have.attr', 'href', '/themes/viva-light/theme.css');

    // Click the theme switch button to change to dark theme
    cy.get('button.theme-switcher').click();

    // Verify localStorage theme is set to dark
    cy.window().then((win) => {
      expect(win.localStorage.getItem('theme')).to.equal('dark');
    });

    // Verify the dark theme CSS file is loaded
    cy.get('link[rel="stylesheet"]').should('have.attr', 'href', '/themes/viva-dark/theme.css');

    // Click the theme switch button again to change back to light theme
    cy.get('button.theme-switcher').click();

    // Verify localStorage theme is set to light
    cy.window().then((win) => {
      expect(win.localStorage.getItem('theme')).to.equal('light');
    });

    // Verify the light theme CSS file is loaded
    cy.get('link[rel="stylesheet"]').should('have.attr', 'href', '/themes/viva-light/theme.css');
  });
});
