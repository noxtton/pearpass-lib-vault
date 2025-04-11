import { createAsyncThunk } from '@reduxjs/toolkit'

import { listRecords } from '../api/listRecords'
import { updateRecords as updateRecordsApi } from '../api/updateRecords'
import { updateFolderFactory } from '../utils/updateFolderFactory'
import { updateRecordsFactory } from '../utils/updateRecordsFactory'

export const updateRecords = createAsyncThunk(
  'vault/updateRecords',
  async (recordsPayload) => {
    const newRecords = updateRecordsFactory(recordsPayload)

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
      console.error('Record not found')
      return
    }

    return dispatch(updateRecords(records))
  }
