import { createAsyncThunk } from '@reduxjs/toolkit'

import { vaultAddFiles } from '../api/addFiles.js'
import { listRecords } from '../api/listRecords'
import { vaultRemoveFiles } from '../api/removeFiles.js'
import { updateRecords as updateRecordsApi } from '../api/updateRecords'
import { extractDeletedIdsFromRecord } from '../utils/extractDeletedIdsFromRecord.js'
import { logger } from '../utils/logger'
import { updateFolderFactory } from '../utils/updateFolderFactory'
import { updateRecordsFactory } from '../utils/updateRecordsFactory'
import { validateAndPrepareBuffersFromRecord } from '../utils/validateAndPrepareBuffersFromRecord.js'

export const updateRecords = createAsyncThunk(
  'vault/updateRecords',
  async (recordsPayload) => {
    const currentRecords = await listRecords()

    const { filesToAdd, filesToRemove, recordsWithoutBuffers } =
      recordsPayload.reduce(
        (acc, record) => {
          const { recordWithoutBuffers, buffersWithId } =
            validateAndPrepareBuffersFromRecord(record)

          acc.filesToAdd.push(
            ...buffersWithId.map(({ id, buffer }) => ({
              recordId: recordWithoutBuffers.id,
              fileId: id,
              buffer
            }))
          )

          acc.filesToRemove.push(
            ...extractDeletedIdsFromRecord({
              newRecord: recordWithoutBuffers,
              currentRecord: currentRecords.find(
                (r) => r.id === recordWithoutBuffers.id
              )
            }).map((fileId) => ({
              recordId: recordWithoutBuffers.id,
              fileId
            }))
          )

          acc.recordsWithoutBuffers.push(recordWithoutBuffers)

          return acc
        },
        { filesToAdd: [], filesToRemove: [], recordsWithoutBuffers: [] }
      )

    const newRecords = updateRecordsFactory(recordsWithoutBuffers)

    if (filesToRemove.length) {
      await vaultRemoveFiles(filesToRemove)
    }

    if (filesToAdd.length) {
      await vaultAddFiles(filesToAdd)
    }

    await updateRecordsApi(newRecords)

    return listRecords()
  }
)

export const updateFolder = (recordIds, folder) => (dispatch, getState) => {
  const { vault } = getState()

  const records = updateFolderFactory(recordIds, folder, vault)

  return dispatch(updateRecords(records))
}

export const updateFavoriteState =
  (recordIds, isFavorite) => (dispatch, getState) => {
    const { vault } = getState()

    const records = recordIds.map((id) => {
      const newRecord = vault.data.records.find((r) => r.id === id)

      if (newRecord) {
        return {
          ...newRecord,
          isFavorite
        }
      }
    })

    if (!records.length) {
      logger.error('Record not found')
      return
    }

    return dispatch(updateRecords(records))
  }
