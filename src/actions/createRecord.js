import { createAsyncThunk } from '@reduxjs/toolkit'

import { vaultAddFiles as addFilesApi } from '../api/addFiles.js'
import { createRecord as createRecordApi } from '../api/createRecord'
import { createRecordFactory } from '../utils/createRecordFactory'
import { validateAndPrepareBuffersFromRecord } from '../utils/validateAndPrepareBuffersFromRecord.js'

export const createRecord = createAsyncThunk(
  'vault/createRecord',
  async (payload, { getState }) => {
    const vaultId = getState().vault.data.id

    const { recordWithoutBuffers, buffersWithId } =
      validateAndPrepareBuffersFromRecord(payload)

    const recordWithPasswordUpdatedAt = {
      ...recordWithoutBuffers,
      data: {
        ...recordWithoutBuffers.data,
        passwordUpdatedAt: Date.now()
      }
    }
    const newRecord = createRecordFactory(recordWithPasswordUpdatedAt, vaultId)

    await createRecordApi(newRecord)

    if (buffersWithId.length) {
      await addFilesApi(
        buffersWithId.map(({ id, buffer }) => ({
          recordId: newRecord.id,
          fileId: id,
          buffer
        }))
      )
    }

    return newRecord
  }
)
