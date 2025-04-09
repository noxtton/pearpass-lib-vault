import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const closeAllInstances = async () => {
  const activeVaultRes = await pearpassVaultClient.activeVaultGetStatus()

  if (activeVaultRes.status) {
    await pearpassVaultClient.activeVaultClose()
  }

  const vaultsRes = await pearpassVaultClient.vaultsGetStatus()

  if (vaultsRes.status) {
    await pearpassVaultClient.vaultsClose()
  }

  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (statusRes?.status) {
    await pearpassVaultClient.encryptionClose()
  }

  return true
}
