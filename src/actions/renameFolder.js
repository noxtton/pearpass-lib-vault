import { createAsyncThunk } from '@reduxjs/toolkit'

import { createRecord as createRecordApi } from '../api/createRecord'
import { deleteRecords as deleteRecordsApi } from '../api/deleteRecords'
import { listRecords } from '../api/listRecords'
import { updateRecords as updateRecordsApi } from '../api/updateRecords'
import { createFolderFactory } from '../utils/createFolderFactory'
import { updateFolderFactory } from '../utils/updateFolderFactory'

export const renameFolder = createAsyncThunk(
  'vault/renameFolder',
  async ({ selectedFolder, newName }, { getState }) => {
    const { vault } = getState()

    if (!selectedFolder) {
      return
    }

    if (selectedFolder.name === newName) {
      return
    }

    const record = createFolderFactory(newName, vault.data.id)

    await createRecordApi(record)

    const recordIds = selectedFolder.records.reduce(
      (recordIds, record) => {
        if (record.data) {
          recordIds.toRename.push(record.id)
        } else {
          recordIds.toDelete.push(record.id)
        }
        return recordIds
      },
      {
        toRename: [],
        toDelete: []
      }
    )

    const records =
      updateFolderFactory(recordIds.toRename, newName, vault) || []

    if (records.length) {
      await updateRecordsApi(records)
    }

    await deleteRecordsApi(recordIds.toDelete)

    const newRecords = listRecords()

    return newRecords
  }
)
