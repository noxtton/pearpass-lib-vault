import { pearpassVaultClient } from '../instances'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

/**
 * @param {{
 *  id: string
 *  name: string
 * }} vault
 * @param {string} password
 * @returns {Promise<void>}
 */
export const createProtectedVault = async (vault, password) => {
  if (!vault?.id) {
    throw new Error('Vault id is required')
  }

  const activeVaultRes = await pearpassVaultClient.activeVaultGetStatus()

  if (activeVaultRes.status) {
    await pearpassVaultClient.activeVaultClose()
  }

  const vaultEncryption = await pearpassVaultClient.encryptVaultKey(password)

  if (
    !hasAllEncryptionData(vaultEncryption) ||
    !vaultEncryption.decryptionKey
  ) {
    throw new Error('Error encrypting vault key')
  }

  const { ciphertext, nonce, salt, decryptionKey } = vaultEncryption

  const encryptionKey = await pearpassVaultClient.decryptVaultKey({
    decryptionKey,
    ciphertext,
    nonce
  })

  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, {
    ...vault,
    encryption: {
      ciphertext,
      nonce,
      salt,
      decryptionKey
    }
  })

  await pearpassVaultClient.activeVaultInit({
    id: vault.id,
    encryptionKey
  })

  await pearpassVaultClient.activeVaultAdd(`vault`, vault)
}
