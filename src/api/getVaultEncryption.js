import { vaultManager } from '../instances'

/**
 * @returns {Promise<any>}
 */
export const getVaultEncryption = async (vaultId) => {
  const statusRes = await vaultManager.encryptionGetStatus()

  if (!statusRes?.status) {
    await vaultManager.encryptionInit()
  }

  const encryptionDataRes = await vaultManager.encryptionGet(`vault/${vaultId}`)

  return encryptionDataRes
}
