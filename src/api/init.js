import { vaultManager } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const init = async () => {
  const res = vaultManager.vaultsGetStatus()

  if (res?.status) {
    return true
  }

  await vaultManager.vaultsInit()

  return true
}
