import { createAsyncThunk } from '@reduxjs/toolkit'

import { deleteRecord as deleteRecordApi } from '../api/deleteRecord'

export const deleteRecord = createAsyncThunk(
  'vault/deleteRecord',
  async ({ recordId, vaultId }) => {
    return await deleteRecordApi(recordId, vaultId)
  }
)
