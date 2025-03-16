import { pearpassVaultClient } from '../instances'

/**
 * @param {string} inviteCode
 * @returns {Promise<void>}
 */
export const pair = async (inviteCode) => {
  const vault = await pearpassVaultClient.pair(inviteCode)

  return vault
}
