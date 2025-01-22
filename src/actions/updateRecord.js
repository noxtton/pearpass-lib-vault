import { createAsyncThunk } from '@reduxjs/toolkit'

import { validateAndPrepareRecord } from '../utils/validateAndPrepareRecord'

export const updateRecord = createAsyncThunk(
  'vault/updateRecord',
  async (payload) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const record = {
            id: payload.id,
            type: payload.type,
            vaultId: payload.vaultId,
            data: payload.data,
            folder: payload.folder || null,
            isPinned: payload.isPinned,
            isFavorite: payload.isFavorite,
            createdAt: payload.createdAt,
            updatedAt: Date.now()
          }

          const newRecord = validateAndPrepareRecord(record)

          resolve(newRecord)
        } catch (error) {
          console.error(error)

          reject(error)
        }
      }, 1000)
    })
  }
)

export const updatePinnedState =
  (recordId, isPinned) => (dispatch, getState) => {
    const { vault } = getState()
    const record = vault.data.records.find((r) => r.id === recordId)

    if (!record) {
      console.error('Record not found')
      return
    }

    const updatedPayload = {
      ...record,
      isPinned
    }

    return dispatch(updateRecord(updatedPayload))
  }

export const updateFolder = (recordId, folder) => (dispatch, getState) => {
  const { vault } = getState()
  const record = vault.data.records.find((r) => r.id === recordId)

  if (!record) {
    console.error('Record not found')
    return
  }

  const updatedPayload = {
    ...record,
    folder
  }

  return dispatch(updateRecord(updatedPayload))
}
