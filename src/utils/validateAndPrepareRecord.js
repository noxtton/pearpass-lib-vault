import { Validator } from 'pearpass-lib-validator'

import { validateAndPrepareCreditCardData } from './validateAndPrepareCreditCardData'
import { validateAndPrepareCustomData } from './validateAndPrepareCustomData'
import { validateAndPrepareIdentityData } from './validateAndPrepareIdentityData'
import { validateAndPrepareLoginData } from './validateAndPrepareLoginData'
import { validateAndPrepareNoteData } from './validateAndPrepareNoteData'

export const recordSchema = Validator.object({
  id: Validator.string().required(),
  version: Validator.number().required(),
  type: Validator.string().required(),
  vaultId: Validator.string().required(),
  folder: Validator.string(),
  isPinned: Validator.boolean().required(),
  isFavorite: Validator.boolean().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

export const validateAndPrepareRecord = (record) => {
  let recordData = record.data

  if (record.type === 'creditCard') {
    recordData = validateAndPrepareCreditCardData(recordData)
  }

  if (record.type === 'custom') {
    recordData = validateAndPrepareCustomData(recordData)
  }

  if (record.type === 'identity') {
    recordData = validateAndPrepareIdentityData(recordData)
  }

  if (record.type === 'login') {
    recordData = validateAndPrepareLoginData(recordData)
  }

  if (record.type === 'note') {
    recordData = validateAndPrepareNoteData(recordData)
  }

  const preparedRecord = {
    id: record.id,
    version: 1,
    type: record.type,
    vaultId: record.vaultId,
    data: recordData,
    folder: record.folder || null,
    isPinned: record.isPinned,
    isFavorite: record.isFavorite,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }

  const errors = recordSchema.validate(preparedRecord)

  if (errors) {
    throw new Error(`Invalid record data: ${JSON.stringify(errors, null, 2)}`)
  }

  return preparedRecord
}
