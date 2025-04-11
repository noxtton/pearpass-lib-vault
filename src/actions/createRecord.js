import { createAsyncThunk } from '@reduxjs/toolkit'

import { createRecord as createRecordApi } from '../api/createRecord'
import { createRecordFactory } from '../utils/createRecordFactory'

export const createRecord = createAsyncThunk(
  'vault/createRecord',
  async (payload, { getState }) => {
    const vaultId = getState().vault.data.id

    const newRecord = createRecordFactory(payload, vaultId)

    await createRecordApi(newRecord)

    return newRecord
  }
)
