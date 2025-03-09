import { vaultManager } from '../instances'

/**
 * @returns {Promise<any>}
 */
export const getEncryption = async () => {
  const statusRes = await vaultManager.encryptionGetStatus()

  if (!statusRes?.status) {
    await vaultManager.encryptionInit()
  }

  const encryptionDataRes = await vaultManager.encryptionGet('encryptionData')

  return encryptionDataRes
}
