import { listVaults } from './listVaults'

/**
 * @returns {Promise<{
 *  salt: string
 *  ciphertext: string
 *  nonce: string
 *  decryptionKey?: string
 * }>}
 */
export const getVaultEncryption = async (vaultId) => {
  const vaults = await listVaults()

  const vault = vaults.find((vault) => vault.id === vaultId)

  if (!vault) {
    throw new Error('Vault not found')
  }

  return vault.encryption
}
