import { listVaults } from './listVaults'

/**
 * Get the vault encryption data
 * @param {string} vaultId
 * @returns {Promise<{
 *  salt?: string
 *  ciphertext?: string
 *  nonce?: string
 *  hashedPassword?: string
 * }>}
 */
export const getVaultEncryption = async (vaultId) => {
  const vaults = await listVaults()

  const vault = vaults.find((vault) => vault.id === vaultId)

  if (!vault) {
    throw new Error('Vault not found')
  }

  return vault.encryption || {}
}
