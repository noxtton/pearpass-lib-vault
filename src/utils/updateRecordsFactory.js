import { validateAndPrepareRecord } from './validateAndPrepareRecord'

export const updateRecordsFactory = (recordsPayload) => {
  const newRecords = recordsPayload.map((payload) => {
    const record = {
      id: payload.id,
      type: payload.type,
      vaultId: payload.vaultId,
      data: payload.data,
      folder: payload.folder || null,
      isFavorite: payload.isFavorite,
      createdAt: payload.createdAt,
      updatedAt: Date.now()
    }

    return validateAndPrepareRecord(record)
  })

  return newRecords
}
