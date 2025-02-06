import {
  activeVaultInstance,
  initActiveVaultInstance,
  pairActiveVaultInstance
} from '../instances/vault'
import { vaultsInstance } from '../instances/vaults'

/**
 * @param {string} inviteCode
 * @returns {Promise<void>}
 */
export const pair = async (inviteCode) => {
  if (!vaultsInstance) {
    throw new Error('Vault not initialised')
  }

  const [vaultId, inviteKey] = inviteCode.split('/')

  await pairActiveVaultInstance(vaultId, inviteKey)

  await initActiveVaultInstance(vaultId)

  const vault = await activeVaultInstance.get('vault')

  await vaultsInstance.add(`vault/${vaultId}`, vault)

  return vault
}
