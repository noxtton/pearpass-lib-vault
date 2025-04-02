import { createAsyncThunk } from '@reduxjs/toolkit'

import { init } from '../api/init'
import { listVaults } from '../api/listVaults'

export const initializeVaults = createAsyncThunk(
  'vaults/initializeVaults',
  async ({ ciphertext, nonce, salt, decryptionKey, password }) => {
    await init({
      ciphertext,
      nonce,
      salt,
      decryptionKey,
      password
    })

    const vaults = await listVaults()

    return vaults
  }
)
