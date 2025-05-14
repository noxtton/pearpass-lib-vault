import { createSlice } from '@reduxjs/toolkit'

import { createFolder } from '../actions/createFolder'
import { createRecord } from '../actions/createRecord'
import { createVault } from '../actions/createVault'
import { deleteFolder } from '../actions/deleteFolder'
import { deleteRecords } from '../actions/deleteRecords'
import { getVaultById } from '../actions/getVaultById'
import { pair } from '../actions/pair'
import { renameFolder } from '../actions/renameFolder'
import { resetState } from '../actions/resetState'
import { updateRecords } from '../actions/updateRecords'

const initialState = {
  isLoading: false,
  isInitialized: false,
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
      .addCase(getVaultById.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getVaultById.fulfilled, (state, action) => {
        state.isLoading = false
        state.isInitialized = true
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
      .addCase(updateRecords.pending, (state) => {
        state.isRecordLoading = true
        state.error = null
      })
      .addCase(updateRecords.fulfilled, (state, action) => {
        state.isRecordLoading = false
        state.data.records = action?.payload ?? []
      })
      .addCase(updateRecords.rejected, (state, action) => {
        console.error(
          `Action updateRecord error:`,
          JSON.stringify(action.error)
        )

        state.isRecordLoading = false
        state.error = action.error
      })

    builder
      .addCase(deleteRecords.pending, (state) => {
        state.isRecordLoading = true
        state.error = null
      })
      .addCase(deleteRecords.fulfilled, (state, action) => {
        state.isRecordLoading = false
        state.data.records = action?.payload ?? []
      })
      .addCase(deleteRecords.rejected, (state, action) => {
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
      .addCase(renameFolder.pending, (state) => {
        state.isFolderLoading = true
      })
      .addCase(renameFolder.fulfilled, (state, action) => {
        state.isFolderLoading = false
        state.data.records = action?.payload ?? []
      })
      .addCase(renameFolder.rejected, (state, action) => {
        console.error(
          `Action createFolder error:`,
          JSON.stringify(action.error)
        )

        state.isFolderLoading = false
        state.error = action.error
      })
    builder
      .addCase(deleteFolder.pending, (state) => {
        state.isFolderLoading = true
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.isFolderLoading = false
        state.data.records = action?.payload ?? []
      })
      .addCase(deleteFolder.rejected, (state, action) => {
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
      .addCase(pair.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(pair.rejected, (state, action) => {
        console.error(`Action pair error:`, JSON.stringify(action.error))

        state.isLoading = false
        state.error = action.error
      })

    builder.addCase(resetState.fulfilled, (state) => {
      state.data = initialState.data
      state.error = initialState.error
      state.isLoading = initialState.isLoading
      state.isInitialized = initialState.isInitialized
      state.isRecordLoading = initialState.isRecordLoading
      state.isFolderLoading = initialState.isFolderLoading
    })
  }
})

export default vaultSlice.reducer
