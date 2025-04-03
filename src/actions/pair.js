import { createAsyncThunk } from '@reduxjs/toolkit'

import { pair as pairApi } from '../api/pair'

export const pair = createAsyncThunk('vault/pair', async (inviteCode) => {
  const vaultId = await pairApi(inviteCode)

  return vaultId
})
