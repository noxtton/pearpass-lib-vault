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
  const mockVaultId = 'test-vault-id'

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    mockDispatch.mockImplementation(() =>
      Promise.resolve({ payload: mockVaultId })
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
    const { result } = renderHook(() => usePair())

    await act(async () => {
      await result.current.pair('invite-code')
    })

    expect(pairAction).toHaveBeenCalledWith('invite-code')
    expect(mockDispatch).toHaveBeenCalledWith('pair-action')
    expect(initListener).toHaveBeenCalledWith({
      vaultId: mockVaultId,
      onUpdate: expect.any(Function)
    })
    expect(result.current.isLoading).toBe(false)
  })

  test('should handle timeout', async () => {
    jest.useFakeTimers()
    mockDispatch.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ payload: mockVaultId }), 20000)
      })
    })

    const { result } = renderHook(() => usePair())

    let error

    const pairPromise = act(async () => {
      const promise = result.current.pair('invite-code')

      // Advance timers past the timeout
      jest.advanceTimersByTime(11000)

      try {
        await promise
      } catch (e) {
        error = e
      }
    })

    jest.advanceTimersByTime(11000)

    await pairPromise

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('Pairing timeout')
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

    expect(getVaultById).toHaveBeenCalledWith({ vaultId: mockVaultId })
    expect(mockDispatch).toHaveBeenCalledWith(
      getVaultById({ vaultId: mockVaultId })
    )
  })
})
