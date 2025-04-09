import { createSlice } from '@reduxjs/toolkit'

import { checkPasswordCreated } from '../actions/checkPasswordCreated'
import { resetState } from '../actions/resetState'

const initialState = {
  isLoading: false,
  isInitialized: false,
  error: null,
  data: {
    hasPasswordSet: false
  }
}

export const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkPasswordCreated.pending, (state) => {
        state.isLoading = true
      })
      .addCase(checkPasswordCreated.fulfilled, (state, action) => {
        state.isLoading = false
        state.isInitialized = true
        state.error = null
        state.data = {
          ...state.data,
          hasPasswordSet: action.payload
        }
      })
      .addCase(checkPasswordCreated.rejected, (state, action) => {
        console.error(action.error)

        state.isLoading = false
        state.error = action.error
      })

    builder.addCase(resetState.fulfilled, (state) => {
      state.isLoading = initialState.isLoading
      state.isInitialized = initialState.isInitialized
      state.error = initialState.error
      state.data = initialState.data
    })
  }
})

export const { setLoading } = userSlice.actions

export default userSlice.reducer
