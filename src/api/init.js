import { vaultManager } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const init = async () => {
  await vaultManager.vaultsInit()

  return true
}
