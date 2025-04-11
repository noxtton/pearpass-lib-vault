import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteRecords as deleteRecordsAction } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'

export const deleteFolder = createAsyncThunk(
  'vault/deleteFolder',
  async (selectedFolder) => {
    if (!selectedFolder) {
      return
    }

    const recordIdsToDelete = selectedFolder.records.map((record) => record.id)

    await deleteRecordsAction(recordIdsToDelete)

    const newRecords = listRecords()

    return newRecords
  }
)
