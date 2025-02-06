import { initInstance } from './utils/initInstance'

export let vaultsInstance
export let isVaultsInitialized = false

/**
 * @param {string} path
 * @returns {Promise<void>}
 */
export const initVaultsInstance = async () => {
  isVaultsInitialized = false

  vaultsInstance = await initInstance('vaults')

  isVaultsInitialized = true
}
