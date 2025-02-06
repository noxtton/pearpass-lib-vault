import {
  activeVaultInstance,
  isActiveVaultInitialized
} from '../instances/vault'

/**
 * @param {{
 *  id: string,
 *  vaultId: string,
 * }} record
 * @returns {Promise<void>}
 */
export const createRecord = async (record) => {
  if (!isActiveVaultInitialized) {
    throw new Error('Vault not initialised')
  }

  await activeVaultInstance.add(`record/${record.id}`, record)
}
