import { vaultManager } from '../instances'

/**
 * @param {{
 *  id: string,
 *  vaultId: string,
 * }} record
 * @returns {Promise<void>}
 */
export const createRecord = async (record) => {
  await vaultManager.activeVaultAdd(`record/${record.id}`, record)
}
