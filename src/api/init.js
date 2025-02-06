import { initVaultsInstance } from '../instances/vaults'

/**
 * @returns {Promise<void>}
 */
export const init = async () => {
  await initVaultsInstance()

  return true
}
