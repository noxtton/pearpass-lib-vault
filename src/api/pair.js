import { vaultManager } from '../instances'

/**
 * @param {string} inviteCode
 * @returns {Promise<void>}
 */
export const pair = async (inviteCode) => {
  const vault = await vaultManager.pair(inviteCode)

  return vault
}
