import { vaultManager } from '../instances'

/**
 * @param {string} vaultId
 * @returns {Promise<string>}
 */
export const createInvite = async () => {
  const inviteCode = await vaultManager.activeVaultCreateInvite()

  return inviteCode
}
