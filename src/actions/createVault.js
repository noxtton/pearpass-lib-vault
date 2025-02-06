import { createAsyncThunk } from '@reduxjs/toolkit'
import { Validator } from 'pearpass-lib-validator'

import { createVault as createVaultApi } from '../api/createVault'
import { VERSION } from '../constants/version'
import { generateUniqueId } from '../utils/generateUniqueId'

const schema = Validator.object({
  id: Validator.string().required(),
  version: Validator.number().required(),
  records: Validator.array().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const createVault = createAsyncThunk('vault/createVault', async () => {
  const vault = {
    id: generateUniqueId(),
    version: VERSION.v1,
    records: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  const errors = schema.validate(vault)

  if (errors) {
    throw new Error(`Invalid vault data: ${JSON.stringify(errors, null, 2)}`)
  }

  await createVaultApi(vault)

  return vault
})
