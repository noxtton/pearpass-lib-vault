import { createAsyncThunk } from '@reduxjs/toolkit'

import { createRecord as createRecordApi } from '../api/createRecord'
import { createRecordsFactory } from '../utils/createRecordsFactory'

export const createRecord = createAsyncThunk(
  'vault/createRecord',
  async (payload, { getState }) => {
    const vaultId = getState().vault.data.id

    const newRecord = createRecordsFactory(payload, vaultId)

    await createRecordApi(newRecord)

    return newRecord
  }
)
