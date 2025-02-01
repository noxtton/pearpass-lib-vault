import { createAsyncThunk } from '@reduxjs/toolkit'

import { listRecords } from '../api/listRecords'
import { listVaults } from '../api/listVaults'

export const getVaultById = createAsyncThunk('vault/getVault', async () => {
  const vaults = await listVaults()

  const selectedVault = vaults?.[vaults.length - 1]

  let records = []

  if (selectedVault) {
    records = await listRecords(selectedVault.id)
  }

  return {
    ...selectedVault,
    records: records ?? []
  }
})
