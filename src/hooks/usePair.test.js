import { renderHook, act } from '@testing-library/react'
import { useDispatch } from 'react-redux'

import { usePair } from './usePair'
import { getVaultById } from '../actions/getVaultById'
import { initListener } from '../api/initListener'
import { pairActiveVault as pairActiveVaultApi } from '../api/pairActiveVault'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn()
}))
jest.mock('../actions/getVaultById', () => ({
  getVaultById: jest.fn()
}))
jest.mock('../api/pairActiveVault', () => ({
  pairActiveVault: jest.fn()
}))
jest.mock('../api/initListener', () => ({
  initListener: jest.fn()
}))

describe('usePair', () => {
  const mockDispatch = jest.fn()
  useDispatch.mockReturnValue(mockDispatch)
  const mockVaultId = 'test-vault-id'

  beforeEach(() => {
    jest.clearAllMocks()

    pairActiveVaultApi.mockReturnValue('pairActiveVault-action')
    initListener.mockResolvedValue(undefined)
  })

  test('should return pairActiveVault function and isLoading state', () => {
    const { result } = renderHook(() => usePair())

    expect(result.current).toEqual({
      pairActiveVault: expect.any(Function),
      isLoading: false
    })
  })

  test('should call pairActiveVaultAction and initListener when pairActiveVault is called', async () => {
    mockDispatch.mockImplementation(() =>
      Promise.resolve({ payload: mockVaultId })
    )

    const { result } = renderHook(() => usePair())

    await act(async () => {
      await result.current.pairActiveVault('invite-code')
    })

    expect(pairActiveVaultApi).toHaveBeenCalledWith('invite-code')
    expect(mockDispatch).toHaveBeenCalledWith('pairActiveVault-action')
    expect(initListener).toHaveBeenCalledWith({
      vaultId: mockVaultId,
      onUpdate: expect.any(Function)
    })
    expect(result.current.isLoading).toBe(false)
  })

  test('should handle timeout', async () => {
    jest.useFakeTimers()

    mockDispatch.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ payload: mockVaultId }), 20000)
        })
    )

    const { result } = renderHook(() => usePair())

    let error

    const pairActiveVaultPromise = act(async () => {
      const promise = result.current.pairActiveVault('invite-code')

      jest.advanceTimersByTime(11000)

      try {
        await promise
      } catch (e) {
        error = e
      }
    })

    jest.advanceTimersByTime(11000)

    await pairActiveVaultPromise

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('pairActiveVaulting timeout')
    expect(result.current.isLoading).toBe(false)

    jest.useRealTimers()
  })

  test('should dispatch getVaultById when listener is triggered', async () => {
    mockDispatch.mockImplementation(() =>
      Promise.resolve({ payload: mockVaultId })
    )

    let onUpdateCallback
    initListener.mockImplementation(({ onUpdate }) => {
      onUpdateCallback = onUpdate
      return Promise.resolve()
    })

    const { result } = renderHook(() => usePair())

    await act(async () => {
      await result.current.pairActiveVault('invite-code')
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
