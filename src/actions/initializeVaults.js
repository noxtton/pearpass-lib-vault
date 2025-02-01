import { createAsyncThunk } from '@reduxjs/toolkit'

import { init } from '../api/init'

export const initializeVaults = createAsyncThunk(
  'vault/initializeVaults',
  async () => {
    return await init()
  }
)
