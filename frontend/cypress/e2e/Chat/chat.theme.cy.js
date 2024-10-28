// cypress/e2e/chat.theme.cy.js

describe('Theme Switch Tests', () => {
  beforeEach(() => {
    // Visit the chat page before each test
    cy.visit('http://localhost:3000/chat');
  });

  it('should load the light theme CSS file if theme is set to light', () => {
    // Set localStorage theme to light
    localStorage.setItem('theme', 'light');

    // Reload the page to apply the theme
    cy.reload();

    // Verify the light theme CSS file is loaded
    cy.get('link[rel="stylesheet"]').should('have.attr', 'href', '/themes/viva-light/theme.css');
  });

  it('should load the dark theme CSS file if theme is set to dark', () => {
    // Set localStorage theme to dark
    localStorage.setItem('theme', 'dark');

    // Reload the page to apply the theme
    cy.reload();

    // Verify the dark theme CSS file is loaded
    cy.get('link[rel="stylesheet"]').should('have.attr', 'href', '/themes/viva-dark/theme.css');
  });

  it('should switch theme and update localStorage when the button is clicked', () => {
    // Initially set theme to light
    localStorage.setItem('theme', 'light');

    // Reload the page to apply the theme
    cy.reload();

    // Verify the light theme CSS file is loaded
    cy.get('link[rel="stylesheet"]').should('have.attr', 'href', '/themes/viva-light/theme.css');

    // Click the theme switch button to switch to dark theme
    cy.get('button.theme-switcher').click();

    // Verify localStorage theme is set to dark
    cy.window().then((win) => {
      expect(win.localStorage.getItem('theme')).to.equal('dark');
    });

    // Verify the dark theme CSS file is loaded
    cy.get('link[rel="stylesheet"]').should('have.attr', 'href', '/themes/viva-dark/theme.css');

    // Click the theme switch button to switch back to light theme
    cy.get('button.theme-switcher').click();

    // Verify localStorage theme is set to light
    cy.window().then((win) => {
      expect(win.localStorage.getItem('theme')).to.equal('light');
    });

    // Verify the light theme CSS file is loaded
    cy.get('link[rel="stylesheet"]').should('have.attr', 'href', '/themes/viva-light/theme.css');
  });
});
