import { vaultManager } from '../instances'

/**
 * @param {{
 *  id: string
 * }} record
 * @returns {Promise<void>}
 */
export const createVault = async (vault) => {
  await vaultManager.vaultsAdd(`vault/${vault.id}`, vault)

  await vaultManager.activeVaultInit(vault.id)

  await vaultManager.activeVaultAdd(`vault`, vault)
}
