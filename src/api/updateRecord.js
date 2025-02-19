import { vaultManager } from '../instances'

/**
 * @param {{
 *  id: string,
 *  vaultId: string,
 * }} record
 * @returns {Promise<void>}
 */
export const updateRecord = async (record) => {
  await vaultManager.activeVaultAdd(`record/${record.id}`, record)
}
