import { vaultManager } from '../instances'

/**
 * @param {{
 *  vaultId: string
 *   onUpdate: () => void
 * }} options
 */
export const initListener = async ({ vaultId, onUpdate }) => {
  await vaultManager.initListener({ vaultId })

  vaultManager.on('update', onUpdate)
}
