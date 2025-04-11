import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteRecords as deleteRecordsAction } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'

export const deleteFolder = createAsyncThunk(
  'vault/deleteFolder',
  async (selectedFolder) => {
    if (!selectedFolder) {
      throw new Error('Selected folder is required')
    }

    const recordIdsToDelete = selectedFolder.records.map((record) => record.id)

    await deleteRecordsAction(recordIdsToDelete)

    return listRecords()
  }
)
