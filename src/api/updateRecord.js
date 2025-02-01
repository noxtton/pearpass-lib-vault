import { initialised, pass } from './init'

export const updateRecord = async (record) => {
  if (!initialised) {
    throw new Error('Autopass not initialised')
  }

  await pass.add(`record/${record.vaultId}/${record.id}`, record)
}
