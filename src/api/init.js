import { vaultManager } from '../instances'

/**
 * @param {string} password
 * @returns {Promise<void>}
 */
export const init = async (password) => {
  const res = await vaultManager.vaultsGetStatus()

  if (res?.status) {
    return true
  }

  await vaultManager.encryptionAdd('encryptionData', { TESTpassword: password })

  await vaultManager.vaultsInit(password)

  return true
}
