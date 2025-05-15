import { pearpassVaultClient } from '../instances'
import { getVaultEncryption } from './getVaultEncryption'

/**
 * @param {{
 *  id: string
 *  name: string
 * }} vault
 * @param {string} password
 * @returns {Promise<void>}
 */
export const updateProtectedVault = async ({
  vault,
  newPassword,
  currentPassword
}) => {
  if (!vault?.id) {
    throw new Error('Vault id is required')
  }

  const activeVaultRes = await pearpassVaultClient.activeVaultGetStatus()

  if (activeVaultRes.status) {
    await pearpassVaultClient.activeVaultClose()
  }

  const currentEncription = await getVaultEncryption(vault.id)

  const currentHashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt: currentEncription.salt,
    password: currentPassword
  })

  if (currentEncription?.hashedPassword !== currentHashedPassword) {
    throw new Error('Invalid password')
  }

  const encryption = {
    ciphertext: currentEncription.ciphertext,
    nonce: currentEncription.nonce,
    salt: currentEncription.salt,
    hashedPassword: currentEncription.hashedPassword
  }

  if (newPassword?.length) {
    const { hashedPassword, salt } =
      await pearpassVaultClient.hashPassword(newPassword)

    const { ciphertext, nonce } =
      await pearpassVaultClient.encryptVaultKeyWithHashedPassword(
        hashedPassword
      )

    encryption.ciphertext = ciphertext
    encryption.nonce = nonce
    encryption.salt = salt
    encryption.hashedPassword = hashedPassword
  }

  const encryptionKey = await pearpassVaultClient.decryptVaultKey({
    hashedPassword: encryption.hashedPassword,
    ciphertext: encryption.ciphertext,
    nonce: encryption.nonce
  })

  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, {
    ...vault,
    encryption: {
      ciphertext: encryption.ciphertext,
      nonce: encryption.nonce,
      salt: encryption.salt,
      hashedPassword: encryption.hashedPassword
    }
  })

  await pearpassVaultClient.activeVaultInit({
    id: vault.id,
    encryptionKey
  })

  await pearpassVaultClient.activeVaultAdd(`vault`, vault)
}
