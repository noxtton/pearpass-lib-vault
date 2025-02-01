import { initialised, pass } from './init'

export const getVault = async (vaultId) => {
  if (!initialised) {
    throw new Error('Autopass not initialised')
  }

  return await pass.get(`vault/${vaultId}`)
}
