import { renderHook, act } from '@testing-library/react'
import { useDispatch } from 'react-redux'

import { usePair } from './usePair'
import { getVaultById } from '../actions/getVaultById'
import { pair as pairAction } from '../actions/pair'
import { initListener } from '../api/initListener'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn()
}))
jest.mock('../actions/getVaultById', () => ({
  getVaultById: jest.fn()
}))
jest.mock('../actions/pair', () => ({
  pair: jest.fn()
}))
jest.mock('../api/initListener', () => ({
  initListener: jest.fn()
}))

describe('usePair', () => {
  const mockDispatch = jest.fn()
  const mockVault = { id: 'test-vault-id' }

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    mockDispatch.mockImplementation(() =>
      Promise.resolve({ payload: mockVault })
    )
    pairAction.mockReturnValue('pair-action')
    initListener.mockResolvedValue(undefined)
  })

  test('should return pair function and isLoading state', () => {
    const { result } = renderHook(() => usePair())

    expect(result.current).toEqual({
      pair: expect.any(Function),
      isLoading: false
    })
  })

  test('should call pairAction and initListener when pair is called', async () => {
    const mockOnCompleted = jest.fn()
    const { result } = renderHook(() =>
      usePair({ onCompleted: mockOnCompleted })
    )

    await act(async () => {
      await result.current.pair('invite-code')
    })

    expect(pairAction).toHaveBeenCalledWith('invite-code')
    expect(mockDispatch).toHaveBeenCalledWith('pair-action')
    expect(initListener).toHaveBeenCalledWith({
      vaultId: mockVault.id,
      onUpdate: expect.any(Function)
    })
    expect(mockOnCompleted).toHaveBeenCalledWith(mockVault)
    expect(result.current.isLoading).toBe(false)
  })

  test('should call onError when pair action fails', async () => {
    const mockError = new Error('Failed to pair')
    mockDispatch.mockRejectedValueOnce(mockError)

    const mockOnError = jest.fn()
    const { result } = renderHook(() => usePair({ onError: mockOnError }))

    await act(async () => {
      await result.current.pair('invite-code')
    })

    expect(mockOnError).toHaveBeenCalledWith(mockError)
    expect(result.current.isLoading).toBe(false)
    expect(initListener).not.toHaveBeenCalled()
  })

  test('should handle timeout', async () => {
    jest.useFakeTimers()
    const mockOnError = jest.fn()

    mockDispatch.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ payload: mockVault }), 20000)
      })
    })

    const { result } = renderHook(() => usePair({ onError: mockOnError }))

    const pairPromise = act(async () => {
      await result.current.pair('invite-code')
    })

    jest.advanceTimersByTime(11000)

    await pairPromise

    expect(mockOnError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Pairing timeout')
      })
    )
    expect(result.current.isLoading).toBe(false)

    jest.useRealTimers()
  })

  test('should dispatch getVaultById when listener is triggered', async () => {
    let onUpdateCallback
    initListener.mockImplementation(({ onUpdate }) => {
      onUpdateCallback = onUpdate
      return Promise.resolve()
    })

    const { result } = renderHook(() => usePair())

    await act(async () => {
      await result.current.pair('invite-code')
    })

    act(() => {
      onUpdateCallback()
    })

    expect(getVaultById).toHaveBeenCalledWith({ vaultId: mockVault.id })
    expect(mockDispatch).toHaveBeenCalledWith(
      getVaultById({ vaultId: mockVault.id })
    )
  })
})
