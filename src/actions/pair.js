import { createAsyncThunk } from '@reduxjs/toolkit'

import { pair as pairApi } from '../api/pair'
import { validateInviteCode } from '../utils/validateInviteCode'

export const pair = createAsyncThunk('vault/pair', (inviteCode) => {
  validateInviteCode(inviteCode)

  return pairApi(inviteCode)
})
