import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteRecord as deleteRecordApi } from '../api/deleteRecord'

export const deleteRecord = createAsyncThunk(
  'vault/deleteRecord',
  async (recordId) => {
    if (!recordId) {
      throw new Error('Record ID is required')
    }

    await deleteRecordApi(recordId)

    return recordId
  }
)
