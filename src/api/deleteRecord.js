import { vaultManager } from '../instances'

/**
 * @param {string} recordId
 * @param {string} vaultId
 * @returns {Promise<void>}
 */
export const deleteRecord = async (recordId) => {
  await vaultManager.activeVaultRemove(`record/${recordId}`)
}
