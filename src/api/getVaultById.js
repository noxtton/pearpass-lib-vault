import { pearpassVaultClient } from '../instances'
import { getVaultEncryption } from './getVaultEncryption'
import { listVaults } from './listVaults'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

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

  if (password) {
    const vaultEncryptionres = await getVaultEncryption(vaultId)

    if (!hasAllEncryptionData(vaultEncryptionres)) {
      throw new Error('Vault encryption data does not exist')
    }

    const { ciphertext, nonce, salt } = vaultEncryptionres

    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      password: password,
      ciphertext,
      nonce,
      salt
    })

    if (!encryptionKey) {
      throw new Error('Error decrypting vault key')
    }
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
