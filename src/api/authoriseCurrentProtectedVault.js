import { pearpassVaultClient } from '../instances'
import { getCurrentVault } from './getCurrentVault'
import { getVaultEncryption } from './getVaultEncryption'

/**
 * @param {string} password
 * @returns {Promise<void>}
 */
export const authoriseCurrentProtectedVault = async (password) => {
  const correntVault = await getCurrentVault()

  const { hashedPassword, salt } = await getVaultEncryption(correntVault.id)

  const currentHashedPassword = await pearpassVaultClient.getDecryptionKey({
    salt: salt,
    password: password
  })

  if (hashedPassword !== currentHashedPassword) {
    throw new Error('Invalid password')
  }

  return true
}
