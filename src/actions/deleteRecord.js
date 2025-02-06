import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteRecord as deleteRecordApi } from '../api/deleteRecord'

export const deleteRecord = createAsyncThunk(
  'vault/deleteRecord',
  async (recordId) => {
    await deleteRecordApi(recordId)

    return recordId
  }
)
