import { createSlice } from '@reduxjs/toolkit'

import { initializeVaults } from '../actions/initializeVaults'

const initialState = {
  isLoading: false,
  data: null,
  error: null
}

export const vaultsSlice = createSlice({
  name: 'vaults',
  initialState: initialState,
  extraReducers: (builder) => {
    builder
      .addCase(initializeVaults.pending, (state) => {
        state.isLoading = true
      })
      .addCase(initializeVaults.fulfilled, (state, action) => {
        state.data = action.payload
        state.isLoading = false
      })
      .addCase(initializeVaults.rejected, (state, action) => {
        console.error(
          `Action initializeVaults error:`,
          JSON.stringify(action.error)
        )

        state.isLoading = false
        state.error = action.error
      })
  }
})

export default vaultsSlice.reducer
