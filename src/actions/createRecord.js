import { createAsyncThunk } from '@reduxjs/toolkit'

import { createRecord as createRecordApi } from '../api/createRecord'
import { generateUniqueId } from '../utils/generateUniqueId'
import { validateAndPrepareRecord } from '../utils/validateAndPrepareRecord'

export const createRecord = createAsyncThunk(
  'vault/createRecord',
  async (payload, { getState }) => {
    const vaultId = getState().vault.data.id

    const record = {
      id: generateUniqueId(),
      type: payload.type,
      vaultId: vaultId,
      data: payload.data,
      folder: payload.folder || null,
      isPinned: !!payload.isPinned,
      isFavorite: !!payload.isFavorite,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const newRecord = validateAndPrepareRecord(record)

    await createRecordApi(newRecord)

    return newRecord
  }
)
