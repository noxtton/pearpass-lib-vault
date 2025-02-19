import { vaultManager } from '../instances'

/**
 * @returns {Promise<Array<any>>}
 */
export const listVaults = async () => {
  const vaults = await vaultManager.vaultsList(`vault/`)

  return vaults
}
