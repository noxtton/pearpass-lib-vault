import { createSlice } from '@reduxjs/toolkit'

import { createInvite } from '../actions/createInvite'

const initialState = {
  isLoading: false,
  error: null,
  data: null
}

export const vaultSlice = createSlice({
  name: 'vault',
  initialState: initialState,
  extraReducers: (builder) => {
    builder
      .addCase(createInvite.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createInvite.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(createInvite.rejected, (state, action) => {
        console.error(action.error)

        state.isLoading = false
        state.error = action.error
      })
  }
})

export default vaultSlice.reducer
