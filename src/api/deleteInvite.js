import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<string>}
 */
export const deleteInvite = async () => {
  return pearpassVaultClient.activeVaultDeleteInvite()
}
