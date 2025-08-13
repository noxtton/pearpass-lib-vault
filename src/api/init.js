import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *   ciphertext: string
 *   nonce: string
 *   hashedPassword: string
 *   password: string
 * }} params
 * @returns {Promise<void>}
 */
export const init = async (params) => {
  const res = await pearpassVaultClient.vaultsGetStatus()

  if (res?.status) {
    return true
  }

  if (params?.ciphertext && params?.nonce && params?.hashedPassword) {
    const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
      ciphertext: params.ciphertext,
      nonce: params.nonce,
      hashedPassword: params.hashedPassword
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

  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const encryptionGetRes =
    await pearpassVaultClient.encryptionGet('masterPassword')

  const { ciphertext, nonce, salt } = encryptionGetRes

  const hashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt,
    password: params.password
  })

  const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
    ciphertext,
    nonce,
    hashedPassword
  })

  if (!decryptVaultKeyRes) {
    throw new Error('Error decrypting vault key')
  }

  await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)

  return true
}
