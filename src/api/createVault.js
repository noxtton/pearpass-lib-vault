import { vaultManager } from '../instances'

/**
 * @param {{
 *  id: string
 * }} record
 * @returns {Promise<void>}
 */
export const createVault = async (vault) => {
  const activeVaultRes = await vaultManager.activeVaultGetStatus()

  if (activeVaultRes.status) {
    await vaultManager.activeVaultClose()
  }

  await vaultManager.vaultsAdd(`vault/${vault.id}`, vault)

  await vaultManager.activeVaultInit(vault.id)

  await vaultManager.activeVaultAdd(`vault`, vault)
}
