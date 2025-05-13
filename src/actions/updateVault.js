import { createAsyncThunk } from '@reduxjs/toolkit'
import { Validator } from 'pear-apps-utils-validator'

import { updateProtectedVault } from '../api/updateProtectedVault'
import { updateVault as updateVaultApi } from '../api/updateVault'

const schema = Validator.object({
  id: Validator.string().required(),
  name: Validator.string().required(),
  version: Validator.number().required(),
  records: Validator.array().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const updateVault = createAsyncThunk(
  'vault/createVault',
  async ({ vault, newPassword, currentPassword }) => {
    const updatedVault = {
      ...vault,
      updatedAt: Date.now()
    }

    const errors = schema.validate(updatedVault)

    if (errors) {
      throw new Error(`Invalid vault data: ${JSON.stringify(errors, null, 2)}`)
    }

    if (newPassword?.length) {
      await updateProtectedVault({
        vault: updatedVault,
        newPassword,
        currentPassword
      })
    } else {
      await updateVaultApi(updatedVault)
    }

    return updatedVault
  }
)
