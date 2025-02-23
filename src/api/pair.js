import { vaultManager } from '../instances'

/**
 * @param {string} inviteCode
 * @returns {Promise<void>}
 */
export const pair = async (inviteCode) => {
  await vaultManager.pair(inviteCode)
}
