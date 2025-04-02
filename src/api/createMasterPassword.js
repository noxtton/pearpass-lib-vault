import { pearpassVaultClient } from '../instances'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

/**
 * @param {string} password
 * @returns {Promise<{
 *   ciphertext: string
 *   nonce: string
 *   salt: string
 *   decryptionKey: string
 * }>}
 */
export const createMasterPassword = async (password) => {
  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const encryptionGetRes =
    await pearpassVaultClient.encryptionGet('masterPassword')

  if (encryptionGetRes) {
    throw new Error('Master password already exists')
  }

  const encryptVaultKeyRes = await pearpassVaultClient.encryptVaultKey(password)

  if (
    !hasAllEncryptionData(encryptVaultKeyRes) ||
    !encryptVaultKeyRes.decryptionKey
  ) {
    throw new Error('Error encrypting vault key')
  }

  const { ciphertext, nonce, salt, decryptionKey } = encryptVaultKeyRes

  const vaultsGetRes = await pearpassVaultClient.vaultsGetStatus()

  if (!vaultsGetRes?.status) {
    const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
      ciphertext,
      nonce,
      decryptionKey
    })

    await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)
  }

  await pearpassVaultClient.vaultsAdd('masterEncryption', {
    ciphertext,
    nonce,
    salt,
    decryptionKey
  })

  await pearpassVaultClient.vaultsClose()

  await pearpassVaultClient.encryptionAdd(`masterPassword`, {
    ciphertext,
    nonce,
    salt
  })

  return encryptVaultKeyRes
}
