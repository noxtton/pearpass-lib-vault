import { initActiveVaultInstance } from '../instances/vault'
import { isVaultsInitialized, vaultsInstance } from '../instances/vaults'

/**
 * @param {{
 *  id: string
 * }} record
 * @returns {Promise<void>}
 */
export const createVault = async (vault) => {
  if (!isVaultsInitialized) {
    throw new Error('Vault not initialised')
  }

  await vaultsInstance.add(`vault/${vault.id}`, vault)

  const activeVaultInstance = await initActiveVaultInstance(vault.id)

  await activeVaultInstance.add(`vault`, vault)
}
