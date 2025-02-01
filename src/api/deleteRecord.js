import { initialised, pass } from './init'

export const deleteRecord = async (recordId, vaultId) => {
  if (!initialised) {
    throw new Error('Autopass not initialised')
  }

  await pass.remove(`record/${vaultId}/${recordId}`)
}
