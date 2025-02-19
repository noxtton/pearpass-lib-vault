import { vaultManager } from '../instances'
import { listVaults } from './listVaults'

/**
 * @param {string} vaultId
 * @returns {Promise<void>}
 */
export const getVaultById = async (vaultId) => {
  const vaults = await listVaults()

  if (!vaults.some((vault) => vault.id === vaultId)) {
    throw new Error('Vault not found')
  }

  const res = await vaultManager.activeVaultGetStatus()

  if (!res.status) {
    await vaultManager.activeVaultInit(vaultId)
  }

  const currentVault = await vaultManager.activeVaultGet(`vault`)

  if (currentVault && vaultId !== currentVault.id) {
    await vaultManager.activeVaultClose()

    await vaultManager.activeVaultInit(vaultId)

    const newVault = await vaultManager.activeVaultGet(`vault`)

    return newVault
  }

  return currentVault
}
