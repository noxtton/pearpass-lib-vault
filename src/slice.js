import { createSlice } from '@reduxjs/toolkit'

import { createFolder } from './actions/createFolder'
import { createRecord } from './actions/createRecord'
import { createVault } from './actions/createVault'
import { deleteRecord } from './actions/deleteRecord'
import { getVaultById } from './actions/getVaultById'
import { updateRecord } from './actions/updateRecord'

const initialState = {
  isLoading: true,
  isRecordLoading: false,
  isFolderLoading: false,
  data: null,
  error: null
}

export const vaultSlice = createSlice({
  name: 'vault',
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(getVaultById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getVaultById.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(getVaultById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error
      })

    builder
      .addCase(createVault.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createVault.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(createVault.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error
      })

    builder
      .addCase(createRecord.pending, (state) => {
        state.isRecordLoading = true
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.isRecordLoading = false
        state.data.records.push(action.payload)
      })
      .addCase(createRecord.rejected, (state, action) => {
        state.isRecordLoading = false
        state.error = action.error
      })

    builder
      .addCase(updateRecord.pending, (state) => {
        state.isRecordLoading = true
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.isRecordLoading = false
        state.data.records =
          state.data?.records?.map((record) =>
            record.id === action.payload.id ? action.payload : record
          ) ?? []
      })
      .addCase(updateRecord.rejected, (state, action) => {
        state.isRecordLoading = false
        state.error = action.error
      })

    builder
      .addCase(deleteRecord.pending, (state) => {
        state.isRecordLoading = true
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.isRecordLoading = false
        state.data.records = state.data.records.filter(
          (record) => record.id !== action.payload
        )
      })
      .addCase(deleteRecord.rejected, (state, action) => {
        state.isRecordLoading = false
        state.error = action.error
      })

    builder
      .addCase(createFolder.pending, (state) => {
        state.isFolderLoading = true
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.isFolderLoading = false
        state.data.records.push(action.payload)
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.isFolderLoading = false
        state.error = action.error
      })
  }
})

export default vaultSlice.reducer
