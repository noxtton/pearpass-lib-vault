import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<string>}
 */
export const createInvite = async () => {
  return pearpassVaultClient.activeVaultCreateInvite()
}
