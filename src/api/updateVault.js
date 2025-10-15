import { pearpassVaultClient } from '../instances'
import { checkVaultIsProtected } from './checkVaultIsProtected'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { initActiveVaultWithCredentials } from './initActiveVaultWithCredentials'

/**
 * @param {{
 *  id: string
 *  name: string
 * }} vault
 * @returns {Promise<void>}
 */
export const updateVault = async (vault, newPassword) => {
  if (!vault?.id) {
    throw new Error('Vault id is required')
  }

  let currentVault
  let encryptionKey
  const masterEncryption = await getMasterPasswordEncryption()

  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (res?.status) {
    currentVault = await pearpassVaultClient.activeVaultGet(`vault`)
    await pearpassVaultClient.activeVaultClose()
  }

  if (newPassword) {
    const { hashedPassword, salt } =
      await pearpassVaultClient.hashPassword(newPassword)

    const { ciphertext, nonce } =
      await pearpassVaultClient.encryptVaultKeyWithHashedPassword(
        hashedPassword
      )

    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      hashedPassword,
      ciphertext,
      nonce
    })

    vault = {
      ...vault,
      encryption: {
        ciphertext,
        nonce,
        salt,
        hashedPassword
      }
    }
  } else {
    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      hashedPassword: masterEncryption.hashedPassword,
      ciphertext: masterEncryption.ciphertext,
      nonce: masterEncryption.nonce
    })
  }

  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, vault)

  await pearpassVaultClient.activeVaultInit({
    id: vault.id,
    encryptionKey
  })

  await pearpassVaultClient.activeVaultAdd(`vault`, vault)

  const currentEncryption = (await checkVaultIsProtected(currentVault.id))
    ? currentVault.encryption
    : masterEncryption

  await initActiveVaultWithCredentials(currentVault.id, currentEncryption)
}
