// cypress/component/ThemeSwitcher.spec.js

import React from 'react';
import ThemeSwitcher from '../../src/components/ThemeSwitcher';

describe('<ThemeSwitcher />', () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure clean state
    localStorage.clear();
    // Ensure the theme link element is present in the DOM
    if (!document.getElementById('theme-link')) {
      const link = document.createElement('link');
      link.id = 'theme-link';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  });

  it('should apply light theme by default', () => {
    cy.mount(<ThemeSwitcher/>);

    // Check if the light theme is applied
    cy.get('#theme-link').should('have.attr', 'href', '/themes/viva-light/theme.css');
  });

  it('should toggle to dark theme when button is clicked', () => {
    cy.mount(<ThemeSwitcher/>);

    // Click the button to switch to dark theme
    cy.get('.theme-switcher').click();

    // Check if the dark theme is applied
    cy.get('#theme-link').should('have.attr', 'href', '/themes/viva-dark/theme.css');

    // Verify localStorage value
    cy.window().then((win) => {
      expect(win.localStorage.getItem('theme')).to.eq('dark');
    });
  });

  it('should retain dark theme on re-render based on localStorage', () => {
    // Set dark theme in localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('theme', 'dark');
    });

    cy.mount(<ThemeSwitcher/>);

    // Check if the dark theme is applied
    cy.get('#theme-link').should('have.attr', 'href', '/themes/viva-dark/theme.css');
  });

  it('should toggle back to light theme when button is clicked again', () => {
    cy.mount(<ThemeSwitcher/>);

    // Click the button to switch to dark theme
    cy.get('.theme-switcher').click();

    // Click the button again to switch back to light theme
    cy.get('.theme-switcher').click();

    // Check if the light theme is applied
    cy.get('#theme-link').should('have.attr', 'href', '/themes/viva-light/theme.css');

    // Verify localStorage value
    cy.window().then((win) => {
      expect(win.localStorage.getItem('theme')).to.eq('light');
    });
  });
});
