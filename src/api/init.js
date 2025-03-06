import { vaultManager } from '../instances'

/**
 * @returns {Promise<void>}
 */
export const init = async () => {
  const res = await vaultManager.vaultsGetStatus()

  if (res?.status) {
    return true
  }

  await vaultManager.vaultsInit()

  return true
}
