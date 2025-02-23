import { vaultManager } from '../instances'

/**
 * @param {string} vaultId
 * @returns {Promise<string>}
 */
export const createInvite = async (vaultId) => {
  const inviteCode = await vaultManager.activeVaultCreateInvite(vaultId)

  return inviteCode
}
