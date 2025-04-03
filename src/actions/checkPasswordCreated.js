import { createAsyncThunk } from '@reduxjs/toolkit'

import { getMasterPasswordEncryption } from '../api/getMasterPasswordEncryption'

export const checkPasswordCreated = createAsyncThunk(
  'user/checkPasswordCreated',
  async () => {
    const masterPasswordEncryption = await getMasterPasswordEncryption()

    const { ciphertext, nonce, salt } = masterPasswordEncryption || {}

    return !!ciphertext && !!nonce && !!salt
  }
)
