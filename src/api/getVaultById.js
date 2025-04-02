import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
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
    const vaultEncryptionRes = await getVaultEncryption(vaultId)

    if (!hasAllEncryptionData(vaultEncryptionRes)) {
      throw new Error('Vault encryption data does not exist')
    }

    const { ciphertext, nonce, salt } = vaultEncryptionRes

    const decryptionKey = await pearpassVaultClient.getDecryptionKey({
      password,
      salt
    })

    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      decryptionKey,
      ciphertext,
      nonce
    })

    if (!encryptionKey) {
      throw new Error('Error decrypting vault key')
    }
  } else {
    const masterEncryption = await getMasterPasswordEncryption()

    if (
      !hasAllEncryptionData(masterEncryption) ||
      !masterEncryption.decryptionKey
    ) {
      throw new Error('Master password encryption data does not exist')
    }

    const { ciphertext, nonce, decryptionKey } = masterEncryption

    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      decryptionKey,
      ciphertext,
      nonce
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
