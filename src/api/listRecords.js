import { vaultManager } from '../instances'

/**
 * @returns {Promise<Array<any>>}
 */
export const listRecords = async () => {
  const records = await vaultManager.activeVaultList(`record/`)

  return records
}
