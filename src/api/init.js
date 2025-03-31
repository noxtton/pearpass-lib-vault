import { pearpassVaultClient } from '../instances'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

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

  const encryptionGetRes =
    await pearpassVaultClient.encryptionGet('masterPassword')

  if (!hasAllEncryptionData(encryptionGetRes)) {
    throw new Error('Master password does not exist')
  }

  const { ciphertext, nonce, salt } = encryptionGetRes

  const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
    ciphertext,
    nonce,
    salt,
    password
  })

  if (!decryptVaultKeyRes) {
    throw new Error('Error decrypting vault key')
  }

  await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)

  return true
}
