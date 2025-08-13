import { createAsyncThunk } from '@reduxjs/toolkit'
import { Validator } from 'pear-apps-utils-validator'

import { checkVaultIsProtected } from '../api/checkVaultIsProtected'
import { getVaultById } from '../api/getVaultById'
import { updateProtectedVault } from '../api/updateProtectedVault'
import { updateVault as updateVaultApi } from '../api/updateVault'

const schema = Validator.object({
  id: Validator.string().required(),
  name: Validator.string().required(),
  version: Validator.number().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const updateVault = createAsyncThunk(
  'vault/updateVault',
  async ({ vaultId, name, newPassword, currentPassword }) => {
    const vault = await getVaultById(vaultId, currentPassword)

    const newVault = {
      ...vault,
      id: vaultId,
      name: name,
      updatedAt: Date.now()
    }

    const errors = schema.validate(newVault)

    if (errors) {
      throw new Error(`Invalid vault data: ${JSON.stringify(errors, null, 2)}`)
    }

    const isProtected = checkVaultIsProtected(vault.id)

    if (isProtected) {
      await updateProtectedVault({
        vault: newVault,
        currentPassword,
        newPassword
      })
    } else {
      await updateVaultApi(newVault)
    }

    return newVault
  }
)
