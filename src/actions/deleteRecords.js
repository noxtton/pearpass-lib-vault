import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteRecords as deleteRecordsApi } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'

export const deleteRecords = createAsyncThunk(
  'vault/deleteRecords',
  async (recordIds) => {
    if (!recordIds.length) {
      throw new Error('Record ID is required')
    }

    await deleteRecordsApi(recordIds)

    return listRecords()
  }
)
