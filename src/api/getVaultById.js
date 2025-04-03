import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { getVaultEncryption } from './getVaultEncryption'
import { listVaults } from './listVaults'

/**
 * @param {string} vaultId
 * @param {string | undefined} password
 * @returns {Promise<void>}
 */
export const getVaultById = async (vaultId, password) => {
  const vaults = await listVaults()

  if (!vaults.some((vault) => vault.id === vaultId)) {
    throw new Error('Vault not found')
  }

  let encryptionKey

  const { ciphertext, nonce, salt } = await getVaultEncryption(vaultId)

  if (!password?.length) {
    const masterEncryption = await getMasterPasswordEncryption()

    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      hashedPassword: masterEncryption.hashedPassword,
      ciphertext,
      nonce
    })
  } else {
    const hashedPassword = await pearpassVaultClient.getDecryptionKey({
      password,
      salt
    })

    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      hashedPassword,
      ciphertext,
      nonce
    })
  }

  if (!encryptionKey) {
    throw new Error('Error decrypting vault key')
  }

  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (!res.status) {
    await pearpassVaultClient.activeVaultInit({ id: vaultId, encryptionKey })
  }

  const currentVault = await pearpassVaultClient.activeVaultGet(`vault`)

  if (currentVault && vaultId !== currentVault.id) {
    await pearpassVaultClient.activeVaultClose()

    await pearpassVaultClient.activeVaultInit({ id: vaultId, encryptionKey })

    const newVault = await pearpassVaultClient.activeVaultGet(`vault`)

    return newVault
  }

  return currentVault
}
