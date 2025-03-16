import { pearpassVaultClient } from '../instances'

/**
 * @param {string} password
 * @returns {Promise<void>}
 */
export const init = async (password) => {
  const res = await pearpassVaultClient.vaultsGetStatus()

  if (res?.status) {
    return true
  }

  if (!password) {
    throw new Error('Password is required')
  }

  await pearpassVaultClient.encryptionAdd('encryptionData', {
    TESTpassword: password
  })

  await pearpassVaultClient.vaultsInit(password)

  return true
}
