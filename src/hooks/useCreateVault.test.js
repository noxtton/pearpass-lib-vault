import { renderHook, act } from '@testing-library/react'
import { useSelector, useDispatch } from 'react-redux'

import { useCreateVault } from './useCreateVault'
import { createVault as createVaultAction } from '../actions/createVault'
import { selectVault } from '../selectors/selectVault'

jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn()
}))

jest.mock('../actions/createVault', () => ({
  createVault: jest.fn()
}))

jest.mock('../selectors/selectVault', () => ({
  selectVault: jest.fn()
}))

describe('useCreateVault', () => {
  const mockDispatch = jest.fn()
  const mockOnCompleted = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isLoading: false }
      }
      return null
    })
    mockDispatch.mockResolvedValue({
      error: null,
      payload: { vault: { id: '123', name: 'Test Vault' } }
    })
  })

  it('should return isLoading state from selector', () => {
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isLoading: true }
      }
      return null
    })

    const { result } = renderHook(() => useCreateVault())

    expect(result.current.isLoading).toBe(true)
  })

  it('should call dispatch with the correct action when createVault is called', async () => {
    createVaultAction.mockReturnValue('MOCKED_ACTION')

    const { result } = renderHook(() => useCreateVault())

    await act(async () => {
      await result.current.createVault({
        name: 'New Vault',
        password: 'secret'
      })
    })

    expect(createVaultAction).toHaveBeenCalledWith({
      name: 'New Vault',
      password: 'secret'
    })
    expect(mockDispatch).toHaveBeenCalledWith('MOCKED_ACTION')
  })

  it('should call onCompleted callback when vault creation succeeds', async () => {
    const mockPayload = { vault: { id: '123', name: 'Test Vault' } }
    mockDispatch.mockResolvedValue({ error: null, payload: mockPayload })

    const { result } = renderHook(() =>
      useCreateVault({ onCompleted: mockOnCompleted })
    )

    await act(async () => {
      await result.current.createVault({ name: 'New Vault' })
    })

    expect(mockOnCompleted).toHaveBeenCalledWith(mockPayload)
  })

  it('should not call onCompleted callback when vault creation fails', async () => {
    mockDispatch.mockResolvedValue({ error: 'Some error', payload: null })

    const { result } = renderHook(() =>
      useCreateVault({ onCompleted: mockOnCompleted })
    )

    await act(async () => {
      await result.current.createVault({ name: 'New Vault' })
    })

    expect(mockOnCompleted).not.toHaveBeenCalled()
  })
})
