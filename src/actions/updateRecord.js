import { createAsyncThunk } from '@reduxjs/toolkit'

import { updateRecord as updateRecordApi } from '../api/updateRecord'
import { validateAndPrepareRecord } from '../utils/validateAndPrepareRecord'

export const updateRecord = createAsyncThunk(
  'vault/updateRecord',
  async (payload) => {
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

    await updateRecordApi(newRecord)

    return newRecord
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

export const updateFavoriteState =
  (recordId, isFavorite) => (dispatch, getState) => {
    const { vault } = getState()
    const record = vault.data.records.find((r) => r.id === recordId)

    if (!record) {
      console.error('Record not found')
      return
    }

    const updatedPayload = {
      ...record,
      isFavorite
    }

    return dispatch(updateRecord(updatedPayload))
  }
