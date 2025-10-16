import { pearpassVaultClient } from '../instances'
import { checkVaultIsProtected } from './checkVaultIsProtected'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { getVaultEncryption } from './getVaultEncryption'
import { initActiveVaultWithCredentials } from './initActiveVaultWithCredentials'

/**
 * @param {Object} params
 * @param {Object} params.vault
 * @param {string} [params.newPassword]
 * @param {string} params.currentPassword
 * @throws {Error}
 */
export const updateProtectedVault = async ({
  vault,
  newPassword,
  currentPassword
}) => {
  if (!vault?.id) {
    throw new Error('Vault id is required')
  }

  let currentVault

  const masterEncryption = await getMasterPasswordEncryption()

  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (res?.status) {
    currentVault = await pearpassVaultClient.activeVaultGet(`vault`)
    await pearpassVaultClient.activeVaultClose()
  }

  const updatingVaultEncryption = await getVaultEncryption(vault.id)

  const updatingVaultHashedPassword =
    await pearpassVaultClient.getDecryptionKey({
      salt: updatingVaultEncryption.salt,
      password: currentPassword
    })

  if (updatingVaultEncryption?.hashedPassword !== updatingVaultHashedPassword) {
    throw new Error('Invalid password')
  }

  if (newPassword?.length) {
    const { hashedPassword, salt } =
      await pearpassVaultClient.hashPassword(newPassword)

    const { ciphertext, nonce } =
      await pearpassVaultClient.encryptVaultKeyWithHashedPassword(
        hashedPassword
      )

    updatingVaultEncryption.ciphertext = ciphertext
    updatingVaultEncryption.nonce = nonce
    updatingVaultEncryption.salt = salt
    updatingVaultEncryption.hashedPassword = hashedPassword
  }

  const encryptionKey = await pearpassVaultClient.decryptVaultKey({
    hashedPassword: updatingVaultEncryption.hashedPassword,
    ciphertext: updatingVaultEncryption.ciphertext,
    nonce: updatingVaultEncryption.nonce
  })

  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, {
    ...vault,
    encryption: {
      ciphertext: updatingVaultEncryption.ciphertext,
      nonce: updatingVaultEncryption.nonce,
      salt: updatingVaultEncryption.salt,
      hashedPassword: updatingVaultEncryption.hashedPassword
    }
  })

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
