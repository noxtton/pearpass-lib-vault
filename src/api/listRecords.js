import { collectValuesByFilter } from './helpers/collectValuesByFilter'

export const listRecords = async (vaultId) =>
  collectValuesByFilter((key) => key.startsWith(`record/${vaultId}/`))
