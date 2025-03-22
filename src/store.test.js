import React from 'react'

import { render } from '@testing-library/react'

import { store, VaultProvider } from './store'
import '@testing-library/jest-dom'

describe('Redux Store', () => {
  test('should have the correct reducers', () => {
    const state = store.getState()

    expect(state).toHaveProperty('vaults')
    expect(state).toHaveProperty('vault')
    expect(state).toHaveProperty('invite')
  })

  test('VaultProvider renders without crashing', () => {
    const { getByText } = render(
      <VaultProvider>
        <div>Test Content</div>
      </VaultProvider>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })
})
