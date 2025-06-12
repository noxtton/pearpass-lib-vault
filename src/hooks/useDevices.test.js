import { act, renderHook } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'

import { useDevices } from './useDevices'
import { deleteDevices as deleteDevicesAction } from '../actions/deleteDevices'
import { getVaultById } from '../actions/getVaultById'
import {
  updateDevices as updateDeviceAction,
  updateFavoriteState as updateFavoriteStateAction,
  updateFolder as updateFolderAction
} from '../actions/updateDevices'
import { selectDevices } from '../selectors/selectDevices'
import { selectVault } from '../selectors/selectVault'

jest.mock('react-redux')
jest.mock('../actions/getVaultById')
jest.mock('../selectors/selectDevices')
jest.mock('../selectors/selectVault')

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/updateDevices', () => ({
  updateDevices: jest.fn(),
  updateFolder: jest.fn(),
  updateFavoriteState: jest.fn()
}))

jest.mock('../actions/deleteDevices', () => ({
  deleteDevices: jest.fn()
}))

describe('useDevices', () => {
  const mockDispatch = jest.fn()
  const mockOnCompleted = jest.fn()
  const mockVaultId = 'test-vault-id'
  const mockData = [{ devices: [{ id: 1 }, { id: 2 }] }]
  const mockPayload = [{ id: mockVaultId, devices: mockData.devices }]
  const onCompletedMock = jest.fn()
  const deletemockPayload = ['device-123']

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    getVaultById.mockReturnValue({ type: 'GET_VAULT_BY_ID' })
    mockDispatch.mockResolvedValue({ payload: mockPayload, error: null })

    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { data: { id: mockVaultId } }
      }
      return { isLoading: false, data: mockData }
    })

    selectDevices.mockReturnValue(() => ({ isLoading: false, data: mockData }))
  })

  it('should return initial state', () => {
    useSelector.mockImplementation(() => ({ isLoading: true, data: null }))

    const { result } = renderHook(() =>
      useDevices({
        variables: { vaultId: mockVaultId }
      })
    )

    expect(result.current).toEqual({
      isLoading: true,
      data: null,
      refetch: expect.any(Function),
      updateFolder: expect.any(Function),
      updateDevices: expect.any(Function),
      updateFavoriteState: expect.any(Function),
      deleteDevices: expect.any(Function)
    })
  })

  it('should fetch vault data on initial render', () => {
    useSelector.mockImplementation(() => ({ isLoading: true, data: null }))

    renderHook(() =>
      useDevices({
        variables: { vaultId: mockVaultId }
      })
    )

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GET_VAULT_BY_ID' })
    expect(getVaultById).toHaveBeenCalledWith({ vaultId: mockVaultId })
  })

  it('should not fetch vault data if shouldSkip is true', () => {
    renderHook(() =>
      useDevices({
        shouldSkip: true,
        variables: { vaultId: mockVaultId }
      })
    )

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should not fetch vault data if data is already present', () => {
    renderHook(() =>
      useDevices({
        variables: { vaultId: mockVaultId }
      })
    )

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should call onCompleted callback after successful fetch', async () => {
    useSelector.mockImplementation(() => ({ isLoading: true, data: null }))

    renderHook(() =>
      useDevices({
        onCompleted: mockOnCompleted,
        variables: { vaultId: mockVaultId }
      })
    )

    await Promise.resolve()

    expect(mockOnCompleted).toHaveBeenCalledWith(mockPayload)
  })

  it('should refetch data when refetch is called', async () => {
    const { result } = renderHook(() =>
      useDevices({
        variables: { vaultId: mockVaultId }
      })
    )

    mockDispatch.mockClear()

    act(() => {
      result.current.refetch()
    })

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GET_VAULT_BY_ID' })
  })

  it('should apply filters and sort from variables', () => {
    const filters = {
      searchPattern: 'test',
      type: 'password',
      folder: 'personal',
      isFavorite: true
    }

    const sort = {
      field: 'name',
      direction: 'asc'
    }

    renderHook(() =>
      useDevices({
        variables: {
          vaultId: mockVaultId,
          filters,
          sort
        }
      })
    )

    expect(selectDevices).toHaveBeenCalledWith({
      filters,
      sort
    })
  })

  test('updateDevice should dispatch the action and call onCompleted on success', async () => {
    const mockResponse = { error: false, payload: { id: '123' } }
    mockDispatch.mockResolvedValue(mockResponse)
    updateDeviceAction.mockReturnValue('UPDATE_RECORD_ACTION')

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useDevices({ onCompleted: onCompletedMock })
    )

    const device = { id: '123', name: 'Test Device' }
    await act(async () => {
      await result.current.updateDevices(device)
    })

    expect(updateDeviceAction).toHaveBeenCalledWith(device)
    expect(mockDispatch).toHaveBeenCalledWith('UPDATE_RECORD_ACTION')
    expect(onCompletedMock).toHaveBeenCalledWith(mockResponse.payload)
  })

  test('updateDevice should not call onCompleted on error', async () => {
    const mockResponse = { error: true, payload: null }
    mockDispatch.mockResolvedValue(mockResponse)

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useDevices({ onCompleted: onCompletedMock })
    )

    await act(async () => {
      await result.current.updateDevices({ id: '123' })
    })

    expect(onCompletedMock).not.toHaveBeenCalled()
  })

  test('updateFolder should dispatch the action and call onCompleted on success', async () => {
    const mockResponse = { error: false, payload: { id: '123' } }
    mockDispatch.mockResolvedValue(mockResponse)
    updateFolderAction.mockReturnValue('UPDATE_FOLDER_ACTION')

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useDevices({ onCompleted: onCompletedMock })
    )

    await act(async () => {
      await result.current.updateFolder('123', 'Test Folder')
    })

    expect(updateFolderAction).toHaveBeenCalledWith('123', 'Test Folder')
    expect(mockDispatch).toHaveBeenCalledWith('UPDATE_FOLDER_ACTION')
    expect(onCompletedMock).toHaveBeenCalledWith(mockResponse.payload)
  })

  test('updateFavoriteState should dispatch the action and call onCompleted on success', async () => {
    const mockResponse = { error: false, payload: { id: '123' } }
    mockDispatch.mockResolvedValue(mockResponse)
    updateFavoriteStateAction.mockReturnValue('UPDATE_FAVORITE_ACTION')

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useDevices({ onCompleted: onCompletedMock })
    )

    await act(async () => {
      await result.current.updateFavoriteState('123', true)
    })

    expect(updateFavoriteStateAction).toHaveBeenCalledWith('123', true)
    expect(mockDispatch).toHaveBeenCalledWith('UPDATE_FAVORITE_ACTION')
    expect(onCompletedMock).toHaveBeenCalledWith(mockResponse.payload)
  })

  test('should expose loading state from the vault selector', () => {
    useSelector.mockImplementation(() => ({ isLoading: true }))

    const { result } = renderHook(() => useDevices())

    expect(result.current.isLoading).toBe(true)
  })

  test('should call deleteDeviceAction with deviceIds', async () => {
    const deviceIds = ['device-123']
    deleteDevicesAction.mockReturnValue('DELETE_RECORD_ACTION')

    const { result } = renderHook(() =>
      useDevices({ onCompleted: onCompletedMock })
    )

    await result.current.deleteDevices(deviceIds)

    expect(deleteDevicesAction).toHaveBeenCalledWith(deviceIds)
    expect(mockDispatch).toHaveBeenCalledWith('DELETE_RECORD_ACTION')
  })

  test('should call onCompleted callback when operation succeeds', async () => {
    const deviceIds = ['device-123']

    mockDispatch.mockResolvedValue({ payload: deviceIds, error: null })

    const { result } = renderHook(() =>
      useDevices({ onCompleted: onCompletedMock })
    )

    await result.current.deleteDevices(deviceIds)

    expect(onCompletedMock).toHaveBeenCalledWith(deletemockPayload)
  })

  test('should not call onCompleted callback when operation fails', async () => {
    const deviceIds = ['device-123']
    mockDispatch.mockResolvedValue({ error: 'Some error', payload: null })

    const { result } = renderHook(() =>
      useDevices({ onCompleted: onCompletedMock })
    )

    await result.current.deleteDevices(deviceIds)

    expect(onCompletedMock).not.toHaveBeenCalled()
  })
})
