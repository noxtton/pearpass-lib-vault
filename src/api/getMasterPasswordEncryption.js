import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<{
 *  ciphertext: string
 *  nonce: string
 *  salt: string
 *  hashedPassword?: string
 * }>}
 */
export const getMasterPasswordEncryption = async () => {
  const res = await pearpassVaultClient.vaultsGetStatus()

  if (res?.status) {
    const masterEncryption =
      await pearpassVaultClient.vaultsGet('masterEncryption')

    return masterEncryption
  }

  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const encryptionGetRes =
    await pearpassVaultClient.encryptionGet('masterPassword')

  return encryptionGetRes
}
