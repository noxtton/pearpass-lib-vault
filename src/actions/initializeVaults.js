import { createAsyncThunk } from '@reduxjs/toolkit'

import { init } from '../api/init'
import { listVaults } from '../api/listVaults'

export const initializeVaults = createAsyncThunk(
  'vaults/initializeVaults',
  async (password) => {
    await init(password)

    const vaults = await listVaults()

    return vaults
  }
)
