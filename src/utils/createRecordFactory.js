import { generateUniqueId } from './generateUniqueId'
import { validateAndPrepareRecord } from './validateAndPrepareRecord'

/**
 * @property {{
 *  type: string,
 *  data: object,
 *  folder: string,
 *  isFavorite: boolean
 * }} payload
 * @property {string} vaultId
 */
export const createRecordFactory = (payload, vaultId) => {
  if (!payload || !vaultId) {
    throw new Error('Payload and vaultId are required')
  }

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

  return validateAndPrepareRecord(record)
}
