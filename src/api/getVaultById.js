import { listVaults } from './listVaults'
import {
  activeVaultInstance,
  closeActiveVaultInstance,
  initActiveVaultInstance,
  isActiveVaultInitialized
} from '../instances/vault'
import { isVaultsInitialized } from '../instances/vaults'

/**
 * @param {string} vaultId
 * @returns {Promise<void>}
 */
export const getVaultById = async (vaultId) => {
  if (!isVaultsInitialized) {
    throw new Error('Vault not initialised')
  }

  const vaults = await listVaults()

  if (!vaults.some((vault) => vault.id === vaultId)) {
    throw new Error('Vault not found')
  }

  if (!isActiveVaultInitialized) {
    await initActiveVaultInstance(vaultId)
  }

  const currentVault = await activeVaultInstance.get(`vault`)

  if (currentVault && vaultId !== currentVault.id) {
    await closeActiveVaultInstance()

    await initActiveVaultInstance(vaultId)

    const newVault = await activeVaultInstance.get(`vault`)

    return newVault
  }

  return currentVault
}
