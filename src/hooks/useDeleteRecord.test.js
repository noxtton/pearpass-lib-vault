import { renderHook } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'

import { useDeleteRecord } from './useDeleteRecord'
import { deleteRecord as deleteRecordAction } from '../actions/deleteRecord'
import { selectVault } from '../selectors/selectVault'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/deleteRecord', () => ({
  deleteRecord: jest.fn()
}))

jest.mock('../selectors/selectVault', () => ({
  selectVault: jest.fn()
}))

describe('useDeleteRecord', () => {
  const dispatchMock = jest.fn()
  const onCompletedMock = jest.fn()
  const mockPayload = { id: 'record-123' }

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(dispatchMock)
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isRecordLoading: false }
      }
      return undefined
    })
    dispatchMock.mockResolvedValue({ error: null, payload: mockPayload })
  })

  test('should return isLoading state', () => {
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isRecordLoading: true }
      }
      return undefined
    })

    const { result } = renderHook(() => useDeleteRecord())

    expect(result.current.isLoading).toBe(true)
  })

  test('should call deleteRecordAction with recordId', async () => {
    const recordId = 'record-123'
    deleteRecordAction.mockReturnValue('DELETE_RECORD_ACTION')

    const { result } = renderHook(() => useDeleteRecord())

    await result.current.deleteRecord(recordId)

    expect(deleteRecordAction).toHaveBeenCalledWith(recordId)
    expect(dispatchMock).toHaveBeenCalledWith('DELETE_RECORD_ACTION')
  })

  test('should call onCompleted callback when operation succeeds', async () => {
    const recordId = 'record-123'

    const { result } = renderHook(() =>
      useDeleteRecord({ onCompleted: onCompletedMock })
    )

    await result.current.deleteRecord(recordId)

    expect(onCompletedMock).toHaveBeenCalledWith(mockPayload)
  })

  test('should not call onCompleted callback when operation fails', async () => {
    const recordId = 'record-123'
    dispatchMock.mockResolvedValue({ error: 'Some error', payload: null })

    const { result } = renderHook(() =>
      useDeleteRecord({ onCompleted: onCompletedMock })
    )

    await result.current.deleteRecord(recordId)

    expect(onCompletedMock).not.toHaveBeenCalled()
  })
})
