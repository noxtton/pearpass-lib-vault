import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'

/**
 * @param {string} inviteCode
 * @returns {Promise<string>}
 */
export const pair = async (inviteCode) => {
  const masterEncryption = await getMasterPasswordEncryption()

  const masterEncryptionKey = await pearpassVaultClient.decryptVaultKey({
    hashedPassword: masterEncryption.hashedPassword,
    ciphertext: masterEncryption.ciphertext,
    nonce: masterEncryption.nonce
  })

  if (!masterEncryptionKey) {
    throw new Error('Failed to decrypt vault key for pairing')
  }

  const { vaultId, encryptionKey } = await pearpassVaultClient.pair(inviteCode)

  const { ciphertext, nonce } = await pearpassVaultClient.encryptVaultWithKey(
    masterEncryption.hashedPassword,
    encryptionKey
  )

  await pearpassVaultClient.activeVaultInit({ id: vaultId, encryptionKey })

  const vault = await pearpassVaultClient.activeVaultGet(`vault`)

  await pearpassVaultClient.vaultsAdd(`vault/${vaultId}`, {
    ...vault,
    encryption: {
      ciphertext,
      nonce
    }
  })

  return vaultId
}
