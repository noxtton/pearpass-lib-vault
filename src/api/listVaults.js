import { collectValuesByFilter } from './helpers/collectValuesByFilter'

export const listVaults = async () =>
  collectValuesByFilter((key) => key.startsWith('vault/'))
