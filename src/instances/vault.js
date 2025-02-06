import { initInstance } from './utils/initInstance'
import { pairInstance } from './utils/pairInstance'

export let activeVaultInstance
export let isActiveVaultInitialized = false
export let listeningVaultId = null

/**
 * @param {{
 *  vaultId: string
 *   onUpdate: () => void
 * }} options
 */
export const initListener = async ({ vaultId, onUpdate }) => {
  if (vaultId === listeningVaultId) {
    return
  }

  activeVaultInstance.on('update', () => {
    onUpdate?.()
  })

  listeningVaultId = vaultId
}

export const closeActiveVaultInstance = async () => {
  await activeVaultInstance?.close?.()

  isActiveVaultInitialized = false
  listeningVaultId = null
}

/**
 * @param {string} id
 * @returns {Promise<Autopass>}
 */
export const initActiveVaultInstance = async (id) => {
  isActiveVaultInitialized = false

  activeVaultInstance = await initInstance(`vault/${id}`)

  isActiveVaultInitialized = true

  return activeVaultInstance
}

/**
 * @param {string} vaultId
 * @param {string} inviteKey
 * @returns {Promise<{id: string}>}
 */
export const pairActiveVaultInstance = async (vaultId, inviteKey) => {
  await closeActiveVaultInstance?.()

  await pairInstance(`vault/${vaultId}`, inviteKey)
}
