import { generateUniqueId } from './generateUniqueId'
import { validateAndPrepareRecord } from './validateAndPrepareRecord'

export const createRecordsFactory = (payload, vaultId) => {
  const record = {
    id: generateUniqueId(),
    type: payload.type,
    vaultId: vaultId,
    data: payload.data,
    folder: payload.folder || null,
    isFavorite: !!payload.isFavorite,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  const newRecord = validateAndPrepareRecord(record)
  return newRecord
}
