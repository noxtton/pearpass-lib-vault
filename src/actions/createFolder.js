import { createAsyncThunk } from '@reduxjs/toolkit'
import { Validator } from 'pearpass-lib-validator'

import { createRecord as createRecordApi } from '../api/createRecord'
import { generateUniqueId } from '../utils/generateUniqueId'

export const recordSchema = Validator.object({
  id: Validator.string().required(),
  vaultId: Validator.string().required(),
  folder: Validator.string().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const createFolder = createAsyncThunk(
  'vault/createFolder',
  async (folderName, { getState }) => {
    const vaultId = getState().vault.data.id

    const record = {
      id: generateUniqueId(),
      vaultId: vaultId,
      folder: folderName,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const errors = recordSchema.validate(record)

    if (errors) {
      throw new Error(`Invalid record data: ${JSON.stringify(errors, null, 2)}`)
    }

    await createRecordApi(record)

    return record
  }
)
