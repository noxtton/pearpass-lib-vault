import { isVaultsInitialized, vaultsInstance } from '../instances/vaults'
import { collectValuesByFilter } from './utils/collectValuesByFilter'

/**
 * @returns {Promise<Array<any>>}
 */
export const listVaults = async () => {
  if (!isVaultsInitialized) {
    throw new Error('Vaults not initialised')
  }

  return collectValuesByFilter(vaultsInstance, (key) =>
    key.startsWith('vault/')
  )
}
