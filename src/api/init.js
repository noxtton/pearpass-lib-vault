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

  if (!password) {
    throw new Error('Password is required')
  }

  await vaultManager.encryptionAdd('encryptionData', { TESTpassword: password })

  await vaultManager.vaultsInit(password)

  return true
}
