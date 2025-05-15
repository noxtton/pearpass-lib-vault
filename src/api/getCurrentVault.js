import { pearpassVaultClient } from '../instances'
import { logger } from '../utils/logger'

/**
 * @returns {Promise<{id: string} | undefined>}
 */
export const getCurrentVault = async () => {
  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (!res?.status) {
    logger.log('No active vault found')

    return undefined
  }

  return pearpassVaultClient.activeVaultGet(`vault`)
}
