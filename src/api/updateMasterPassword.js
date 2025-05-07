import { pearpassVaultClient } from '../instances'
import { listVaults } from './listVaults'
// Removed unused import 'updateVault'

/**
 * @param {string} password
 * @returns {Promise<{
 *   ciphertext: string
 *   nonce: string
 *   salt: string
 *   hashedPassword: string
 * }>}
 */
export const updateMasterPassword = async (password) => {
  const statusRes = await pearpassVaultClient.encryptionGetStatus()
  const vaults = await listVaults()

  const unProtectedvaults = vaults.filter(
    (vault) => !vault.hashedPassword && !vault.salt
  )

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const { hashedPassword, salt } =
    await pearpassVaultClient.hashPassword(password)

  const { ciphertext, nonce } =
    await pearpassVaultClient.encryptVaultKeyWithHashedPassword(hashedPassword)

  const vaultsGetRes = await pearpassVaultClient.vaultsGetStatus()

  if (!vaultsGetRes?.status) {
    const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
      ciphertext,
      nonce,
      hashedPassword
    })

    await pearpassVaultClient.vaultsInit(decryptVaultKeyRes)
  }

  await pearpassVaultClient.vaultsAdd('masterEncryption', {
    ciphertext,
    nonce,
    salt,
    hashedPassword
  })

  if (unProtectedvaults.length > 0) {
    const decryptVaultKeyRes = await pearpassVaultClient.decryptVaultKey({
      ciphertext,
      nonce,
      hashedPassword
    })

    for (const vault of unProtectedvaults) {
      await pearpassVaultClient.activeVaultClose()

      await pearpassVaultClient.activeVaultInit({
        id: vault.id,
        encryptionKey: decryptVaultKeyRes
      })

      await pearpassVaultClient.activeVaultAdd(`vault`, vault)

      await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, {
        ...vault,
        encryption: {
          ciphertext,
          nonce
        }
      })
    }
  }

  await pearpassVaultClient.encryptionAdd(`masterPassword`, {
    ciphertext,
    nonce,
    salt
  })

  return { hashedPassword, salt, ciphertext, nonce }
}
