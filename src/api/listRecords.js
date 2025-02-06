import {
  activeVaultInstance,
  isActiveVaultInitialized
} from '../instances/vault'
import { collectValuesByFilter } from './utils/collectValuesByFilter'

/**
 * @returns {Promise<Array<any>>}
 */
export const listRecords = async () => {
  if (!isActiveVaultInitialized) {
    throw new Error('Vault not initialised')
  }

  return collectValuesByFilter(activeVaultInstance, (key) =>
    key.startsWith(`record/`)
  )
}
