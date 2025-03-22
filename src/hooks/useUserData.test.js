import { renderHook, act, waitFor } from '@testing-library/react'

import { useUserData } from './useUserData'
import { getEncryption } from '../api/getEncryption'
import '@testing-library/jest-dom'

jest.mock('../api/getEncryption')

describe('useUserData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default values', async () => {
    getEncryption.mockResolvedValueOnce(null)

    const { result } = renderHook(() => useUserData())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.hasPasswordSet).toBe(false)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.hasPasswordSet).toBe(false)
    })
  })

  it('should detect when password is set', async () => {
    getEncryption.mockResolvedValueOnce({ TESTpassword: 'password123' })

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useUserData({ onCompleted: onCompletedMock })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(result.current.hasPasswordSet).toBe(true)
      expect(onCompletedMock).toHaveBeenCalledWith({ hasPasswordSet: true })
    })
  })

  it('should handle login with correct password', async () => {
    getEncryption.mockResolvedValue({ TESTpassword: 'password123' })

    const { result } = renderHook(() => useUserData())

    await waitFor(async () => {
      await act(async () => {
        await result.current.logIn('password123')
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should throw error on login with incorrect password', async () => {
    getEncryption.mockResolvedValue({ TESTpassword: 'password123' })

    const { result } = renderHook(() => useUserData())

    await waitFor(async () => {
      await expect(
        act(async () => {
          await result.current.logIn('wrongpassword')
        })
      ).rejects.toThrow('Invalid password')
    })
  })

  it('should handle error during initial check', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const error = new Error('API error')
    getEncryption.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useUserData())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(error)

      consoleErrorSpy.mockRestore()
    })
  })
})
