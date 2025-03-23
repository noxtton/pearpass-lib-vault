import { updateRecord, updateFolder, updateFavoriteState } from './updateRecord'
import { updateRecord as updateRecordApi } from '../api/updateRecord'
import { validateAndPrepareRecord } from '../utils/validateAndPrepareRecord'

jest.mock('../api/updateRecord', () => ({
  updateRecord: jest.fn()
}))

jest.mock('../utils/validateAndPrepareRecord', () => ({
  validateAndPrepareRecord: jest.fn((record) => record)
}))

describe('updateRecord actions', () => {
  const mockDate = 1633000000000
  let dispatch, getState

  beforeEach(() => {
    jest.clearAllMocks()
    global.Date.now = jest.fn().mockReturnValue(mockDate)

    dispatch = jest.fn().mockImplementation((fn) => {
      if (typeof fn === 'function') {
        return fn(dispatch, getState)
      }
      return fn
    })

    getState = jest.fn().mockReturnValue({
      vault: {
        data: {
          records: [
            {
              id: 'record-1',
              type: 'password',
              vaultId: 'vault-1',
              data: {},
              folder: 'folder-1',
              isFavorite: false,
              createdAt: 1632000000000
            },
            {
              id: 'record-2',
              type: 'note',
              vaultId: 'vault-1',
              data: {},
              folder: null,
              isFavorite: true,
              createdAt: 1632000000000
            }
          ]
        }
      }
    })

    updateRecordApi.mockResolvedValue({})
  })

  describe('updateRecord thunk', () => {
    it('should update a record with the correct properties', async () => {
      const payload = {
        id: 'record-1',
        type: 'password',
        vaultId: 'vault-1',
        data: { username: 'test', password: 'test123' },
        folder: 'folder-1',
        isFavorite: false,
        createdAt: 1632000000000
      }

      const thunk = updateRecord(payload)
      const result = await thunk(dispatch, getState)

      expect(result.payload).toEqual({
        ...payload,
        updatedAt: mockDate
      })
    })

    it('should call updateRecordApi with the validated record', async () => {
      const payload = {
        id: 'record-1',
        type: 'password',
        vaultId: 'vault-1',
        data: { username: 'test', password: 'test123' },
        folder: 'folder-1',
        isFavorite: false,
        createdAt: 1632000000000
      }

      const thunk = updateRecord(payload)
      await thunk(dispatch, getState)

      expect(validateAndPrepareRecord).toHaveBeenCalledWith({
        ...payload,
        updatedAt: mockDate
      })
      expect(updateRecordApi).toHaveBeenCalledWith({
        ...payload,
        updatedAt: mockDate
      })
    })

    it('should set folder to null if not provided', async () => {
      const payload = {
        id: 'record-1',
        type: 'password',
        vaultId: 'vault-1',
        data: {},
        isFavorite: false,
        createdAt: 1632000000000
      }

      const thunk = updateRecord(payload)
      const result = await thunk(dispatch, getState)

      expect(result.payload.folder).toBeNull()
    })
  })

  describe('updateFolder', () => {
    it('should dispatch updateRecord with updated folder', () => {
      updateFolder('record-1', 'new-folder')(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith(expect.any(Function))
      expect(updateRecordApi).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'record-1',
          folder: 'new-folder',
          updatedAt: mockDate
        })
      )
    })

    it('should not dispatch if record is not found', () => {
      const result = updateFolder('non-existent', 'new-folder')(
        dispatch,
        getState
      )

      expect(result).toBeUndefined()
      expect(updateRecordApi).not.toHaveBeenCalled()
    })
  })

  describe('updateFavoriteState', () => {
    it('should dispatch updateRecord with updated isFavorite', () => {
      updateFavoriteState('record-1', true)(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith(expect.any(Function))
      expect(updateRecordApi).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'record-1',
          isFavorite: true,
          updatedAt: mockDate
        })
      )
    })

    it('should not dispatch if record is not found', () => {
      const result = updateFavoriteState('non-existent', true)(
        dispatch,
        getState
      )

      expect(result).toBeUndefined()
      expect(updateRecordApi).not.toHaveBeenCalled()
    })
  })
})
