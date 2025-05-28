export { RECORD_TYPES } from './constants/recordTypes'

export { useCreateFolder } from './hooks/useCreateFolder'
export { useCreateRecord } from './hooks/useCreateRecord'
export { useCreateVault } from './hooks/useCreateVault'
export { useFolders } from './hooks/useFolders'
export { useRecordById } from './hooks/useRecordById'
export { useRecordCountsByType } from './hooks/useRecordCountsByType'
export { useRecords } from './hooks/useRecords'
export { useVaults } from './hooks/useVaults'
export { useVault } from './hooks/useVault'
export { useInvite } from './hooks/useInvite.js'
export { usePair } from './hooks/usePair'
export { useUserData } from './hooks/useUserData'

export { VaultProvider } from './store'

export { setPearpassVaultClient, setStoragePath } from './instances'
export { closeAllInstances } from './api/closeAllInstances'

export { getVaultById } from './api/getVaultById'
export { getVaultEncryption } from './api/getVaultEncryption'
export { listRecords } from './api/listRecords'
