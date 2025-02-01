import { initialised, pass } from './init'

export const createVault = async (vault) => {
  if (!initialised) {
    throw new Error('Autopass not initialised')
  }

  await pass.add(`vault/${vault.id}`, vault)
}
