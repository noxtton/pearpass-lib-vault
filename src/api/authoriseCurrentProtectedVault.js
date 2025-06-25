import { pearpassVaultClient } from '../instances'
import { getCurrentVault } from './getCurrentVault'
import { getVaultEncryption } from './getVaultEncryption'

/**
 * @param {string} password
 * @returns {Promise<void>}
 */
export const authoriseCurrentProtectedVault = async (password) => {
  const currentVault = await getCurrentVault()

  const { hashedPassword, salt } = await getVaultEncryption(currentVault.id)

  const currentHashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt: salt,
    password: password
  })

  if (hashedPassword !== currentHashedPassword) {
    throw new Error('Invalid password')
  }

  return true
}
