import { vaultManager } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const closeAllInstances = async () => {
  const activeVaultRes = await vaultManager.activeVaultGetStatus()

  if (activeVaultRes.status) {
    await vaultManager.activeVaultClose()
  }

  const vaultsRes = await vaultManager.vaultsGetStatus()

  if (vaultsRes.status) {
    await vaultManager.vaultsClose()
  }

  const statusRes = await vaultManager.encryptionGetStatus()

  if (statusRes?.status) {
    await vaultManager.encryptionClose()
  }

  return true
}
