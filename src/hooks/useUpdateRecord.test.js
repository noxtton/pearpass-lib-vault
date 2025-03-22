import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'

import { useUpdateRecord } from './useUpdateRecord'
import {
  updateRecord as updateRecordAction,
  updateFolder as updateFolderAction,
  updateFavoriteState as updateFavoriteStateAction
} from '../actions/updateRecord'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/updateRecord', () => ({
  updateRecord: jest.fn(),
  updateFolder: jest.fn(),
  updateFavoriteState: jest.fn()
}))

jest.mock('../selectors/selectVault', () => ({
  selectVault: jest.fn()
}))

describe('useUpdateRecord', () => {
  let mockDispatch

  beforeEach(() => {
    mockDispatch = jest.fn()
    useDispatch.mockReturnValue(mockDispatch)
    useSelector.mockImplementation(() => ({ isRecordLoading: false }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return the correct properties', () => {
    const { result } = renderHook(() => useUpdateRecord())

    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('updateRecord')
    expect(result.current).toHaveProperty('updateFolder')
    expect(result.current).toHaveProperty('updateFavoriteState')
  })

  test('updateRecord should dispatch the action and call onCompleted on success', async () => {
    const mockResponse = { error: false, payload: { id: '123' } }
    mockDispatch.mockResolvedValue(mockResponse)
    updateRecordAction.mockReturnValue('UPDATE_RECORD_ACTION')

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useUpdateRecord({ onCompleted: onCompletedMock })
    )

    const record = { id: '123', name: 'Test Record' }
    await act(async () => {
      await result.current.updateRecord(record)
    })

    expect(updateRecordAction).toHaveBeenCalledWith(record)
    expect(mockDispatch).toHaveBeenCalledWith('UPDATE_RECORD_ACTION')
    expect(onCompletedMock).toHaveBeenCalledWith(mockResponse.payload)
  })

  test('updateRecord should not call onCompleted on error', async () => {
    const mockResponse = { error: true, payload: null }
    mockDispatch.mockResolvedValue(mockResponse)

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useUpdateRecord({ onCompleted: onCompletedMock })
    )

    await act(async () => {
      await result.current.updateRecord({ id: '123' })
    })

    expect(onCompletedMock).not.toHaveBeenCalled()
  })

  test('updateFolder should dispatch the action and call onCompleted on success', async () => {
    const mockResponse = { error: false, payload: { id: '123' } }
    mockDispatch.mockResolvedValue(mockResponse)
    updateFolderAction.mockReturnValue('UPDATE_FOLDER_ACTION')

    const onCompletedMock = jest.fn()
    const { result } = renderHook(() =>
      useUpdateRecord({ onCompleted: onCompletedMock })
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
      useUpdateRecord({ onCompleted: onCompletedMock })
    )

    await act(async () => {
      await result.current.updateFavoriteState('123', true)
    })

    expect(updateFavoriteStateAction).toHaveBeenCalledWith('123', true)
    expect(mockDispatch).toHaveBeenCalledWith('UPDATE_FAVORITE_ACTION')
    expect(onCompletedMock).toHaveBeenCalledWith(mockResponse.payload)
  })

  test('should expose loading state from the vault selector', () => {
    useSelector.mockImplementation(() => ({ isRecordLoading: true }))

    const { result } = renderHook(() => useUpdateRecord())

    expect(result.current.isLoading).toBe(true)
  })
})
