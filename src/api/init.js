import { pearpassVaultClient } from '../instances'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

/**
 * @param {{
 *   ciphertext: string
 *   nonce: string
 *   decryptionKey: string
 *   password: string
 * }} params
 * @returns {Promise<void>}
 */
export const init = async (params) => {
  const res = await pearpassVaultClient.vaultsGetStatus()

  if (res?.status) {
    return true
  }

  if (params?.ciphertext && params?.nonce && params?.decryptionKey) {
    const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
      ciphertext: params.ciphertext,
      nonce: params.nonce,
      decryptionKey: params.decryptionKey
    })

    if (!decryptVaultKeyRes) {
      throw new Error('Error decrypting vault key')
    }

    await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)

    return true
  }

  if (!params.password) {
    throw new Error('Password is required')
  }

  const encryptionGetRes =
    await pearpassVaultClient.encryptionGet('masterPassword')

  if (!hasAllEncryptionData(encryptionGetRes)) {
    throw new Error('Master password does not exist')
  }

  const { ciphertext, nonce, salt } = encryptionGetRes

  const decryptionKey = await pearpassVaultClient.getDecryptionKey({
    salt,
    password: params.password
  })

  const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
    ciphertext,
    nonce,
    decryptionKey
  })

  if (!decryptVaultKeyRes) {
    throw new Error('Error decrypting vault key')
  }

  await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)

  return true
}
