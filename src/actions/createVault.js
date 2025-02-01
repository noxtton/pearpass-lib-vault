import { createAsyncThunk } from '@reduxjs/toolkit'
import { Validator } from 'pearpass-lib-validator'

import { generateUniqueId } from '../utils/generateUniqueId'

const schema = Validator.object({
  id: Validator.string().required(),
  version: Validator.number().required(),
  records: Validator.array().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const createVault = createAsyncThunk('vault/createVault', async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const vault = {
        id: generateUniqueId(),
        version: 1,
        records: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      const errors = schema.validate(vault)

      if (errors) {
        reject({
          message: `Invalid vault data: ${JSON.stringify(errors, null, 2)}`
        })

        return
      }

      resolve(vault)
    }, 1500)
  })
})
