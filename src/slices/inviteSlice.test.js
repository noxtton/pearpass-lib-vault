import inviteReducer from './inviteSlice'
import { createInvite } from '../actions/createInvite'
import { deleteInvite } from '../actions/deleteInvite'
import { resetState } from '../actions/resetState'

describe('inviteSlice', () => {
  const initialState = {
    isLoading: false,
    error: null,
    data: null
  }

  it('should return the initial state', () => {
    expect(inviteReducer(undefined, { type: undefined })).toEqual(initialState)
  })

  it('should handle createInvite.pending', () => {
    const action = { type: createInvite.pending.type }
    const state = inviteReducer(initialState, action)
    expect(state).toEqual({
      ...initialState,
      isLoading: true
    })
  })

  it('should handle createInvite.fulfilled', () => {
    const mockPayload = { id: '123', name: 'Test Invite' }
    const action = {
      type: createInvite.fulfilled.type,
      payload: mockPayload
    }
    const state = inviteReducer(initialState, action)
    expect(state).toEqual({
      ...initialState,
      data: mockPayload,
      isLoading: false
    })
  })

  it('should handle createInvite.rejected', () => {
    const mockError = { message: 'Error occurred' }
    const action = {
      type: createInvite.rejected.type,
      error: mockError
    }
    const state = inviteReducer(initialState, action)
    expect(state).toEqual({
      ...initialState,
      error: mockError,
      isLoading: false
    })
  })

  it('should handle deleteInvite.pending', () => {
    const action = { type: deleteInvite.pending.type }
    const state = inviteReducer(initialState, action)
    expect(state).toEqual({
      ...initialState,
      isLoading: true
    })
  })

  it('should handle deleteInvite.fulfilled', () => {
    const mockPayload = null
    const action = {
      type: deleteInvite.fulfilled.type,
      payload: mockPayload
    }
    const state = inviteReducer(initialState, action)
    expect(state).toEqual({
      ...initialState,
      data: mockPayload,
      isLoading: false
    })
  })

  it('should handle deleteInvite.rejected', () => {
    const mockError = { message: 'Error occurred' }
    const action = {
      type: deleteInvite.rejected.type,
      error: mockError
    }
    const state = inviteReducer(initialState, action)
    expect(state).toEqual({
      ...initialState,
      error: mockError,
      isLoading: false
    })
  })

  it('should handle resetState.fulfilled', () => {
    const modifiedState = {
      isLoading: true,
      error: { message: 'Error' },
      data: { id: '123' }
    }
    const action = { type: resetState.fulfilled.type }
    const state = inviteReducer(modifiedState, action)
    expect(state).toEqual(initialState)
  })
})
