import { collectValuesByFilter } from './utils/collectValuesByFilter'

export const listRecords = async (vaultId) =>
  collectValuesByFilter((key) => key.startsWith(`record/${vaultId}/`))
