export { RECORD_TYPES } from './constants/recordTypes'

export * from './hooks'

export { VaultProvider } from './store'

export { closeAllInstances } from './api/closeAllInstances'
export { setPearpassVaultClient, setStoragePath } from './instances'

export { authoriseCurrentProtectedVault } from './api/authoriseCurrentProtectedVault'
export { getVaultById } from './api/getVaultById'
export { getVaultEncryption } from './api/getVaultEncryption'
export { listRecords } from './api/listRecords'

