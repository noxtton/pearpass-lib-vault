import { createAsyncThunk } from '@reduxjs/toolkit'

import { getVaultById as getVaultByIdApi } from '../api/getVaultById'
import { listRecords } from '../api/listRecords'

export const getVaultById = createAsyncThunk(
  'vault/getVault',
  async (vaultId) => {
    const vault = await getVaultByIdApi(vaultId)

    if (!vault) {
      throw new Error('Vault not found')
    }

    const records = (await listRecords(vault.id)) ?? []

    return {
      ...vault,
      records: records ?? []
    }
  }
)
