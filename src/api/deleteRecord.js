import { pearpassVaultClient } from '../instances'

/**
 * @param {string} recordId
 * @param {string} vaultId
 * @returns {Promise<void>}
 */
export const deleteRecord = async (recordId) => {
  if (!recordId) {
    throw new Error('Record ID is required')
  }

  await pearpassVaultClient.activeVaultRemove(`record/${recordId}`)
}
