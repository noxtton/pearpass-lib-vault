import { pearpassVaultClient } from '../instances'
import { listVaults } from './listVaults'

/**
 * @param {string} vaultId
 * @param {string | undefined} password
 * @returns {Promise<void>}
 */
export const getVaultById = async (vaultId, password) => {
  const vaults = await listVaults()

  if (!vaults.some((vault) => vault.id === vaultId)) {
    throw new Error('Vault not found')
  }

  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (!res.status) {
    await pearpassVaultClient.activeVaultInit(vaultId, password)
  }

  const currentVault = await pearpassVaultClient.activeVaultGet(`vault`)

  if (currentVault && vaultId !== currentVault.id) {
    await pearpassVaultClient.activeVaultClose()

    await pearpassVaultClient.activeVaultInit(vaultId, password)

    const newVault = await pearpassVaultClient.activeVaultGet(`vault`)

    return newVault
  }

  return currentVault
}
