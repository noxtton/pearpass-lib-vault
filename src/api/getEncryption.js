import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<any>}
 */
export const getEncryption = async () => {
  const statusRes = await pearpassVaultClient.encryptionGetStatus()

  if (!statusRes?.status) {
    await pearpassVaultClient.encryptionInit()
  }

  const encryptionDataRes =
    await pearpassVaultClient.encryptionGet('encryptionData')

  return encryptionDataRes
}
