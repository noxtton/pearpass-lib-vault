import { createAsyncThunk } from '@reduxjs/toolkit'

import { getVaultById as getVaultByIdApi } from '../api/getVaultById'
import { listRecords } from '../api/listRecords'

export const getVaultById = createAsyncThunk(
  'vault/getVault',
  async (vaultId, password) => {
    const vault = await getVaultByIdApi(vaultId, password)

    if (!vault) {
      throw new Error('Vault not found ' + vaultId)
    }

    const records = (await listRecords(vault.id)) ?? []

    return {
      ...vault,
      records: records ?? []
    }
  }
)
