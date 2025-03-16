import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<any>}
 */
export const getVaultEncryption = async (vaultId) => {
  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const encryptionDataRes = await pearpassVaultClient.encryptionGet(
    `vault/${vaultId}`
  )

  return encryptionDataRes
}
