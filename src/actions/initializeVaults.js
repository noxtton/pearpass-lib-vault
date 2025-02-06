import { createAsyncThunk } from '@reduxjs/toolkit'

import { init } from '../api/init'
import { listVaults } from '../api/listVaults'

export const initializeVaults = createAsyncThunk(
  'vault/initializeVaults',
  async () => {
    await init()

    const vaults = await listVaults()

    return vaults
  }
)
