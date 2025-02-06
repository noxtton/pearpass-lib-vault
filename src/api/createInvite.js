import {
  activeVaultInstance,
  isActiveVaultInitialized
} from '../instances/vault'

/**
 * @param {string} vaultId
 * @returns {Promise<string>}
 */
export const createInvite = async (vaultId) => {
  if (!isActiveVaultInitialized) {
    throw new Error('Vault not initialised')
  }

  const inviteCode = await activeVaultInstance.createInvite()

  return `${vaultId}/${inviteCode}`
}
