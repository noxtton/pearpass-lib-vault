import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteRecords as deleteRecordsApi } from '../api/deleteRecords'

export const deleteRecords = createAsyncThunk(
  'vault/deleteRecords',
  async (recordIds) => {
    if (!recordIds.length) {
      throw new Error('Record ID is required')
    }

    await deleteRecordsApi(recordIds)

    return recordIds
  }
)
