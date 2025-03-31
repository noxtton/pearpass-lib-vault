import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<{
 *  ciphertext: string
 *  nonce: string
 *  salt: string
 * }>}
 */
export const getMasterPasswordEncryption = async () => {
  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const encryptionGetRes =
    await pearpassVaultClient.encryptionGet('masterPassword')

  return encryptionGetRes
}
