import { createSlice } from '@reduxjs/toolkit'

import { createFolder } from '../actions/createFolder'
import { createRecord } from '../actions/createRecord'
import { createVault } from '../actions/createVault'
import { deleteRecord } from '../actions/deleteRecord'
import { getVaultById } from '../actions/getVaultById'
import { initializeVaults } from '../actions/initializeVaults'
import { pair } from '../actions/pair'
import { updateRecord } from '../actions/updateRecord'

const initialState = {
  isInitialized: false,
  isInitializing: false,
  isLoading: false,
  isRecordLoading: false,
  isFolderLoading: false,
  data: null,
  error: null
}

export const vaultSlice = createSlice({
  name: 'vault',
  initialState: initialState,
  extraReducers: (builder) => {
    builder
      .addCase(initializeVaults.pending, (state) => {
        state.isInitializing = true
      })
      .addCase(initializeVaults.fulfilled, (state) => {
        state.isInitializing = false
        state.isInitialized = true
      })
      .addCase(initializeVaults.rejected, (state, action) => {
        console.error(
          `Action initializeVaults error:`,
          JSON.stringify(action.error)
        )

        state.isLoading = false
        state.error = action.error
      })

    builder
      .addCase(getVaultById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getVaultById.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(getVaultById.rejected, (state, action) => {
        console.error(
          `Action getVaultById error:`,
          JSON.stringify(action.error)
        )

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
        console.error(`Action createVault error:`, JSON.stringify(action.error))

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
        console.error(
          `Action createRecord error:`,
          JSON.stringify(action.error)
        )

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
        console.error(
          `Action updateRecord error:`,
          JSON.stringify(action.error)
        )

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
        console.error(
          `Action deleteRecord error:`,
          JSON.stringify(action.error)
        )

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
        console.error(
          `Action createFolder error:`,
          JSON.stringify(action.error)
        )

        state.isFolderLoading = false
        state.error = action.error
      })

    builder
      .addCase(pair.pending, (state) => {
        state.isLoading = true
      })
      .addCase(pair.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(pair.rejected, (state, action) => {
        console.error(`Action pair error:`, JSON.stringify(action.error))

        state.isLoading = false
        state.error = action.error
      })
  }
})

export default vaultSlice.reducer
