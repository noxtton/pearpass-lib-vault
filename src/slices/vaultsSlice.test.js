import { configureStore } from '@reduxjs/toolkit'

import vaultsReducer from './vaultsSlice'
import { createVault } from '../actions/createVault'
import { getVaults } from '../actions/getVaults'
import { initializeVaults } from '../actions/initializeVaults'
import { resetState } from '../actions/resetState'

jest.mock('../actions/initializeVaults')
jest.mock('../actions/getVaults')
jest.mock('../actions/createVault')
jest.mock('../actions/resetState')

describe('vaultsSlice', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        vaults: vaultsReducer
      }
    })
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().vaults
      expect(state.isInitialized).toBe(false)
      expect(state.isInitializing).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.data).toBeNull()
      expect(state.error).toBeNull()
    })
  })

  describe('initializeVaults', () => {
    it('should set loading states when pending', () => {
      store.dispatch({ type: initializeVaults.pending.type })
      const state = store.getState().vaults

      expect(state.isLoading).toBe(true)
      expect(state.isInitializing).toBe(true)
    })

    it('should set data and reset loading states when fulfilled', () => {
      const mockPayload = [{ id: '1', name: 'Test Vault' }]

      store.dispatch({
        type: initializeVaults.fulfilled.type,
        payload: mockPayload
      })

      const state = store.getState().vaults
      expect(state.data).toEqual(mockPayload)
      expect(state.isLoading).toBe(false)
      expect(state.isInitializing).toBe(false)
      expect(state.isInitialized).toBe(true)
    })

    it('should set error and reset loading states when rejected', () => {
      const mockError = { message: 'Failed to initialize vaults' }

      store.dispatch({
        type: initializeVaults.rejected.type,
        error: mockError
      })

      const state = store.getState().vaults
      expect(state.error).toEqual(mockError)
      expect(state.isLoading).toBe(false)
      expect(state.isInitializing).toBe(false)
    })
  })

  describe('getVaults', () => {
    it('should set loading state when pending', () => {
      store.dispatch({ type: getVaults.pending.type })
      const state = store.getState().vaults

      expect(state.isLoading).toBe(true)
    })

    it('should set data and reset loading state when fulfilled', () => {
      const mockPayload = [{ id: '1', name: 'Test Vault' }]

      store.dispatch({
        type: getVaults.fulfilled.type,
        payload: mockPayload
      })

      const state = store.getState().vaults
      expect(state.data).toEqual(mockPayload)
      expect(state.isLoading).toBe(false)
    })

    it('should set error when rejected', () => {
      const mockError = { message: 'Failed to get vaults' }

      store.dispatch({
        type: getVaults.rejected.type,
        error: mockError
      })

      const state = store.getState().vaults
      expect(state.error).toEqual(mockError)
    })
  })

  describe('createVault', () => {
    it('should add new vault to data when fulfilled', () => {
      const initialData = [{ id: '1', name: 'First Vault' }]
      const newVault = { id: '2', name: 'New Vault' }

      store.dispatch({
        type: getVaults.fulfilled.type,
        payload: initialData
      })

      store.dispatch({
        type: createVault.fulfilled.type,
        payload: newVault
      })

      const state = store.getState().vaults
      expect(state.data).toEqual([...initialData, newVault])
    })
  })

  describe('resetState', () => {
    it('should reset state to initial values', () => {
      store.dispatch({
        type: initializeVaults.fulfilled.type,
        payload: [{ id: '1', name: 'Test Vault' }]
      })

      store.dispatch({
        type: resetState.fulfilled.type
      })

      const state = store.getState().vaults
      expect(state.isInitialized).toBe(false)
      expect(state.isInitializing).toBe(false)
      expect(state.isLoading).toBe(false)
      expect(state.data).toBeNull()
      expect(state.error).toBeNull()
    })
  })
})
