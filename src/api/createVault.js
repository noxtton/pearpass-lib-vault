import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *  id: string
 * }} record
 * @returns {Promise<void>}
 */
export const createVault = async (vault) => {
  const activeVaultRes = await pearpassVaultClient.activeVaultGetStatus()

  if (activeVaultRes.status) {
    await pearpassVaultClient.activeVaultClose()
  }

  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, vault)

  await pearpassVaultClient.activeVaultInit(vault.id)

  await pearpassVaultClient.activeVaultAdd(`vault`, vault)
}
