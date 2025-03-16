import { pearpassVaultClient } from '../instances'

/**
 * @param {string} vaultId
 * @returns {Promise<string>}
 */
export const createInvite = async () => {
  const inviteCode = await pearpassVaultClient.activeVaultCreateInvite()

  return inviteCode
}
