import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'

import { useCreateVault } from './useCreateVault'
import { createVault as createVaultAction } from '../actions/createVault'
import { selectVault } from '../selectors/selectVault'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
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
      return {}
    })
    mockDispatch.mockResolvedValue({
      error: null,
      payload: { vault: 'test-vault' }
    })
  })

  test('should return isLoading state from selector', () => {
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isLoading: true }
      }
      return {}
    })

    const { result } = renderHook(() => useCreateVault())

    expect(result.current.isLoading).toBe(true)
    expect(useSelector).toHaveBeenCalledWith(selectVault)
  })

  test('should call dispatch with createVaultAction when createVault is called', async () => {
    createVaultAction.mockReturnValue('create-vault-action')

    const { result } = renderHook(() => useCreateVault())

    await act(async () => {
      await result.current.createVault()
    })

    expect(createVaultAction).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith('create-vault-action')
  })

  test('should call onCompleted when createVault succeeds', async () => {
    mockDispatch.mockResolvedValue({
      error: null,
      payload: { vault: 'new-vault' }
    })

    const { result } = renderHook(() =>
      useCreateVault({ onCompleted: mockOnCompleted })
    )

    await act(async () => {
      await result.current.createVault()
    })

    expect(mockOnCompleted).toHaveBeenCalledWith({ vault: 'new-vault' })
  })

  test('should not call onCompleted when createVault fails', async () => {
    mockDispatch.mockResolvedValue({ error: 'some-error', payload: null })

    const { result } = renderHook(() =>
      useCreateVault({ onCompleted: mockOnCompleted })
    )

    await act(async () => {
      await result.current.createVault()
    })

    expect(mockOnCompleted).not.toHaveBeenCalled()
  })

  test('should handle undefined onCompleted without errors', async () => {
    mockDispatch.mockResolvedValue({
      error: null,
      payload: { vault: 'new-vault' }
    })

    const { result } = renderHook(() => useCreateVault())

    await act(async () => {
      await result.current.createVault()
    })

    expect(mockDispatch).toHaveBeenCalled()
  })
})
