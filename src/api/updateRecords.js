import { pearpassVaultClient } from '../instances'

/**
 * @param {Array<any>}records
 * @returns {Promise<void>}
 */
export const updateRecords = async (records) => {
  if (!records?.length) {
    throw new Error('Record is required')
  }

  const promises = records.map((record) =>
    pearpassVaultClient.activeVaultAdd(`record/${record.id}`, record)
  )

  await Promise.all(promises)
}
