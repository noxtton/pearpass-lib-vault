import { pearpassVaultClient } from '../instances'

/**
 * @param {{
 *   ciphertext: string
 *   nonce: string
 *   hashedPassword: string
 * }} params
 * @returns {Promise<boolean>}
 */
export const initWithCredentials = async (params) => {
  if (!params.ciphertext || !params.nonce || !params.hashedPassword) {
    throw new Error('Missing required parameters')
  }

  const res = await pearpassVaultClient.vaultsGetStatus()

  if (res?.status) {
    const encryptionGetRes =
      await pearpassVaultClient.vaultsGet('masterEncryption')

    if (
      encryptionGetRes.ciphertext !== params.ciphertext ||
      encryptionGetRes.nonce !== params.nonce ||
      encryptionGetRes.hashedPassword !== params.hashedPassword
    ) {
      throw new Error(
        'Provided credentials do not match existing master encryption'
      )
    }

    return true
  }

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
