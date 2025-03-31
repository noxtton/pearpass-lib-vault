import { createAsyncThunk } from '@reduxjs/toolkit'

import { getMasterPasswordEncryption } from '../api/getMasterPasswordEncryption'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

export const checkPasswordCreated = createAsyncThunk(
  'user/checkPasswordCreated',
  async () => {
    const masterPasswordEncryption = await getMasterPasswordEncryption()

    return hasAllEncryptionData(masterPasswordEncryption)
  }
)
