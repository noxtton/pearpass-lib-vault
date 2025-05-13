import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { listVaults } from './listVaults'

/**
 * @param {{password: string, currentPassword: string}} porps
 * @returns {Promise<{
 *   hashedPassword: string
 *   salt: string
 *   ciphertext: string
 *   nonce: string
 * }>}
 */
export const updateMasterPassword = async ({
  newPassword,
  currentPassword
}) => {
  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const vaults = await listVaults()

  const unProtectedvaults = vaults.filter(
    (vault) => !vault.hashedPassword && !vault.salt
  )

  const { hashedPassword, salt } =
    await pearpassVaultClient.hashPassword(newPassword)

  const currentEncription = await getMasterPasswordEncryption()

  const currentHashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt: currentEncription.salt,
    password: currentPassword
  })

  if (currentEncription?.hashedPassword !== currentHashedPassword) {
    throw new Error('Invalid password')
  }

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
