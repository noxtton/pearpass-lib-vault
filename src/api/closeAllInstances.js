import { vaultManager } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const closeAllInstances = async () => {
  await vaultManager.activeVaultClose()

  await vaultManager.vaultsClose()

  return true
}
