import { pearpassVaultClient } from '../instances'

/**
 * @param {string} vaultId
 * @returns {Promise<string>}
 */
export const createInvite = async () => {
  return pearpassVaultClient.activeVaultCreateInvite()
}
