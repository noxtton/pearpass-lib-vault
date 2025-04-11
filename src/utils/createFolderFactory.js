import { Validator } from 'pear-apps-utils-validator'

import { generateUniqueId } from './generateUniqueId'

export const recordSchema = Validator.object({
  id: Validator.string().required(),
  vaultId: Validator.string().required(),
  folder: Validator.string().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const createFolderFactory = (folderName, vaultId) => {
  const record = {
    id: generateUniqueId(),
    vaultId: vaultId,
    folder: folderName,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  const errors = recordSchema.validate(record)

  if (errors) {
    throw new Error(`Invalid record data: ${JSON.stringify(errors, null, 2)}`)
  }

  return record
}
