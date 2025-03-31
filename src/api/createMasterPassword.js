import { pearpassVaultClient } from '../instances'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

/**
 * @param {string} password
 * @returns {Promise<void>}
 */
export const createMasterPassword = async (password) => {
  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const encryptionGetRes =
    await pearpassVaultClient.encryptionGet('masterPassword')

  if (encryptionGetRes) {
    throw new Error('Master password already exists')
  }

  const encryptVaultKeyRes = await pearpassVaultClient.encryptVaultKey(password)

  if (!hasAllEncryptionData(encryptVaultKeyRes)) {
    throw new Error('Error encrypting vault key')
  }

  await pearpassVaultClient.encryptionAdd(`masterPassword`, encryptVaultKeyRes)
}
