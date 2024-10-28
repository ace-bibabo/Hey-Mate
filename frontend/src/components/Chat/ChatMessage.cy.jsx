import React from 'react'
import ChatMessage from './ChatMessage'

describe('<ChatMessage />', () => {
  it('renders', () => {

    const message = {
      content: 'Test',
      type: 'text'
    };
    const isUser = false;
    const isLoading = false;
    const showBubble = true;

    cy.mount(<ChatMessage message={message} isUser={isUser} isLoading={isLoading} showBubble={showBubble}/>)
  })
})