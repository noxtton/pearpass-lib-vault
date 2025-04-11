import { pearpassVaultClient } from '../instances'

/**
 * @param {Array<string>} recordIds
 * @returns {Promise<void>}
 */
export const deleteRecords = async (recordIds) => {
  if (!recordIds?.length) {
    throw new Error('Record ID is required')
  }

  const promises = recordIds.map((recordId) =>
    pearpassVaultClient.activeVaultRemove(`record/${recordId}`)
  )

  await Promise.all(promises)
}
