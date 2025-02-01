import { collectValuesByFilter } from './utils/collectValuesByFilter'

export const listVaults = async () =>
  collectValuesByFilter((key) => key.startsWith('vault/'))
