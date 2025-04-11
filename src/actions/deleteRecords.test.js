import { deleteRecords as deleteRecords } from './deleteRecords'
import { deleteRecords as deleteRecordsApi } from '../api/deleteRecords'

jest.mock('../api/deleteRecords', () => ({
  deleteRecords: jest.fn()
}))

describe('deleteRecord', () => {
  const mockRecordId = 'record-123'

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
    deleteRecordsApi.mockResolvedValue({})
  })

  it('should call deleteRecordApi with correct recordId', async () => {
    const thunk = deleteRecords(mockRecordId)
    await thunk(dispatch, getState)

    expect(deleteRecordsApi).toHaveBeenCalledWith(mockRecordId)
  })

  it('should return recordId as payload', async () => {
    const thunk = deleteRecords(mockRecordId)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual(mockRecordId)
  })

  it('should handle rejection when API call fails', async () => {
    const errorMessage = 'Failed to delete record'
    deleteRecordsApi.mockRejectedValue(new Error(errorMessage))

    const thunk = deleteRecords(mockRecordId)
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(deleteRecords.rejected.type)
    expect(result.error.message).toContain(errorMessage)
  })

  it('should throw error when recordId is not provided', async () => {
    const thunk = deleteRecords()
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(deleteRecords.rejected.type)
  })
})
