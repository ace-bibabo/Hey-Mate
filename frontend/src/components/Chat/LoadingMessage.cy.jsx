import React from 'react'
import LoadingMessage from './LoadingMessage'

describe('<LoadingMessage />', () => {
  it('renders', () => {
    cy.mount(<LoadingMessage/>)
  })
})