// cypress/component/ToastNotification.spec.js

import React, { useRef } from 'react';
import ToastNotification from '../../src/components/ToastNotification';

describe('<ToastNotification />', () => {
  it('should show a toast notification with the given parameters', () => {
    // Create a wrapper component to test ToastNotification
    const Wrapper = () => {
      const toastRef = useRef(null);

      const showToast = () => {
        toastRef.current.show('success', 'Test Summary', 'Test Detail');
      };

      return (
        <div>
          <ToastNotification ref={toastRef}/>
          <button onClick={showToast}>Show Toast</button>
        </div>
      );
    };

    // Mount the wrapper component
    cy.mount(<Wrapper/>);

    // Click the button to show the toast notification
    cy.get('button').click();

    // Verify the toast notification appears with the correct content
    cy.get('.p-toast-message').should('exist');
    cy.get('.p-toast-summary').should('contain', 'Test Summary');
    cy.get('.p-toast-detail').should('contain', 'Test Detail');
  });
});
