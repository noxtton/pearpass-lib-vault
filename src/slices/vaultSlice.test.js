import vaultReducer from './vaultSlice'
import { createRecord } from '../actions/createRecord'
import { createVault } from '../actions/createVault'
import { deleteRecords } from '../actions/deleteRecords'
import { getVaultById } from '../actions/getVaultById'
import { resetState } from '../actions/resetState'
import { updateRecords } from '../actions/updateRecords'

const initialState = {
  isLoading: false,
  isInitialized: false,
  isRecordLoading: false,
  isFolderLoading: false,
  isDeviceLoading: false,
  data: null,
  error: null
}

describe('vaultSlice reducer', () => {
  it('should return the initial state when passed an empty action', () => {
    expect(vaultReducer(undefined, { type: '' })).toEqual(initialState)
  })

  describe('getVaultById actions', () => {
    it('should handle pending state', () => {
      const action = { type: getVaultById.pending.type }
      const state = vaultReducer(initialState, action)
      expect(state.isLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockVault = { id: 1, name: 'Test Vault', records: [] }
      const action = { type: getVaultById.fulfilled.type, payload: mockVault }
      const state = vaultReducer(initialState, action)
      expect(state.isLoading).toBe(false)
      expect(state.data).toEqual(mockVault)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Error getting vault' }
      const action = { type: getVaultById.rejected.type, error: mockError }
      const state = vaultReducer(initialState, action)
      expect(state.isLoading).toBe(false)
      expect(state.error).toEqual(mockError)
    })
  })

  describe('createVault actions', () => {
    it('should handle pending state', () => {
      const action = { type: createVault.pending.type }
      const state = vaultReducer(initialState, action)
      expect(state.isLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockVault = { id: 1, name: 'New Vault', records: [] }
      const action = { type: createVault.fulfilled.type, payload: mockVault }
      const state = vaultReducer(initialState, action)
      expect(state.isLoading).toBe(false)
      expect(state.data).toEqual(mockVault)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Error creating vault' }
      const action = { type: createVault.rejected.type, error: mockError }
      const state = vaultReducer(initialState, action)
      expect(state.isLoading).toBe(false)
      expect(state.error).toEqual(mockError)
    })
  })

  describe('createRecord actions', () => {
    it('should handle pending state', () => {
      const action = { type: createRecord.pending.type }
      const state = vaultReducer(initialState, action)
      expect(state.isRecordLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockRecord = { id: 1, title: 'Test Record' }
      const existingState = {
        ...initialState,
        data: { records: [] }
      }
      const action = { type: createRecord.fulfilled.type, payload: mockRecord }
      const state = vaultReducer(existingState, action)
      expect(state.isRecordLoading).toBe(false)
      expect(state.data.records).toContain(mockRecord)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Error creating record' }
      const action = { type: createRecord.rejected.type, error: mockError }
      const state = vaultReducer(initialState, action)
      expect(state.isRecordLoading).toBe(false)
      expect(state.error).toEqual(mockError)
    })
  })

  describe('updateRecords actions', () => {
    it('should handle pending state', () => {
      const action = { type: updateRecords.pending.type }
      const state = vaultReducer(initialState, action)
      expect(state.isRecordLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const mockRecord = { id: 1, title: 'Updated Record' }
      const existingState = {
        ...initialState,
        data: {
          records: [
            { id: 1, title: 'Old Record' },
            { id: 2, title: 'Another Record' }
          ]
        }
      }
      const action = {
        type: updateRecords.fulfilled.type,
        payload: [mockRecord]
      }
      const state = vaultReducer(existingState, action)
      expect(state.isRecordLoading).toBe(false)
      expect(state.data.records).toContainEqual(mockRecord)
      expect(state.data.records.find((r) => r.id === 1).title).toBe(
        'Updated Record'
      )
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Error updating record' }
      const action = { type: updateRecords.rejected.type, error: mockError }
      const state = vaultReducer(initialState, action)
      expect(state.isRecordLoading).toBe(false)
      expect(state.error).toEqual(mockError)
    })
  })

  describe('deleteRecords actions', () => {
    it('should handle pending state', () => {
      const action = { type: deleteRecords.pending.type }
      const state = vaultReducer(initialState, action)
      expect(state.isRecordLoading).toBe(true)
    })

    it('should handle fulfilled state', () => {
      const existingState = {
        ...initialState,
        data: {
          records: [
            { id: 1, title: 'Record 1' },
            { id: 2, title: 'Record 2' }
          ]
        }
      }
      const action = {
        type: deleteRecords.fulfilled.type,
        payload: [{ id: 2, title: 'Record 2' }]
      }
      const state = vaultReducer(existingState, action)
      expect(state.isRecordLoading).toBe(false)
      expect(state.data.records.length).toBe(1)
      expect(state.data.records[0].id).toBe(2)
    })

    it('should handle rejected state', () => {
      const mockError = { message: 'Error deleting record' }
      const action = { type: deleteRecords.rejected.type, error: mockError }
      const state = vaultReducer(initialState, action)
      expect(state.isRecordLoading).toBe(false)
      expect(state.error).toEqual(mockError)
    })
  })

  describe('resetState action', () => {
    it('should reset state to initial values', () => {
      const modifiedState = {
        isLoading: true,
        isInitialized: true,
        isRecordLoading: true,
        isFolderLoading: true,
        isDeviceLoading: true,
        data: { some: 'data' },
        error: { message: 'error' }
      }
      const action = { type: resetState.fulfilled.type }
      const state = vaultReducer(modifiedState, action)
      expect(state).toEqual(initialState)
    })
  })
})
