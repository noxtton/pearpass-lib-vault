import { createAsyncThunk } from '@reduxjs/toolkit'

import { pair as pairApi } from '../api/pair'

export const pair = createAsyncThunk('vault/pair', async (inviteCode) => {
  const vault = await pairApi(inviteCode)

  return vault
})
