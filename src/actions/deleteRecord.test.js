import { deleteRecord } from './deleteRecord'
import { deleteRecord as deleteRecordApi } from '../api/deleteRecord'

jest.mock('../api/deleteRecord', () => ({
  deleteRecord: jest.fn()
}))

describe('deleteRecord', () => {
  const mockRecordId = 'record-123'

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
    deleteRecordApi.mockResolvedValue({})
  })

  it('should call deleteRecordApi with correct recordId', async () => {
    const thunk = deleteRecord(mockRecordId)
    await thunk(dispatch, getState)

    expect(deleteRecordApi).toHaveBeenCalledWith(mockRecordId)
  })

  it('should return recordId as payload', async () => {
    const thunk = deleteRecord(mockRecordId)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual(mockRecordId)
  })

  it('should handle rejection when API call fails', async () => {
    const errorMessage = 'Failed to delete record'
    deleteRecordApi.mockRejectedValue(new Error(errorMessage))

    const thunk = deleteRecord(mockRecordId)
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(deleteRecord.rejected.type)
    expect(result.error.message).toContain(errorMessage)
  })

  it('should throw error when recordId is not provided', async () => {
    const thunk = deleteRecord()
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(deleteRecord.rejected.type)
  })
})
