import { Validator } from 'pear-apps-utils-validator'

import { logger } from './logger'
import { validateAndPrepareCreditCardData } from './validateAndPrepareCreditCardData'
import { validateAndPrepareCustomData } from './validateAndPrepareCustomData'
import { validateAndPrepareIdentityData } from './validateAndPrepareIdentityData'
import { validateAndPrepareLoginData } from './validateAndPrepareLoginData'
import { validateAndPrepareNoteData } from './validateAndPrepareNoteData'
import { VERSION } from '../constants/version'

export const recordSchema = Validator.object({
  id: Validator.string().required(),
  version: Validator.number().required(),
  type: Validator.string().required(),
  vaultId: Validator.string().required(),
  folder: Validator.string(),
  isFavorite: Validator.boolean().required(),
  createdAt: Validator.number().required(),
  updatedAt: Validator.number().required()
})

/**
 * @param {Object} record
 * @returns {Object}
 * @throws {Error}
 */
const validateRecord = (record) => {
  if (!record || typeof record !== 'object') {
    logger.error('Invalid record data: Record must be an object')

    throw new Error('Invalid record data: Record must be an object')
  }

  const validTypes = ['creditCard', 'custom', 'identity', 'login', 'note']

  if (!validTypes.includes(record.type)) {
    logger.error(`Invalid record data: Unknown record type "${record.type}"`)
    throw new Error(`Invalid record data: Unknown record type "${record.type}"`)
  }

  const errors = recordSchema.validate(record)

  if (errors) {
    logger.error(`Invalid record data: ${JSON.stringify(errors, null, 2)}`)

    throw new Error(`Invalid record data: ${JSON.stringify(errors, null, 2)}`)
  }

  return record
}

/**
 * @param {Object} record
 * @returns {Object}
 * @throws {Error}
 */
export const validateAndPrepareRecord = (record) => {
  let recordData

  if (record.type === 'creditCard') {
    recordData = validateAndPrepareCreditCardData(record.data)
  }

  if (record.type === 'custom') {
    recordData = validateAndPrepareCustomData(record.data)
  }

  if (record.type === 'identity') {
    recordData = validateAndPrepareIdentityData(record.data)
  }

  if (record.type === 'login') {
    recordData = validateAndPrepareLoginData(record.data)
  }

  if (record.type === 'note') {
    recordData = validateAndPrepareNoteData(record.data)
  }

  return validateRecord({
    id: record.id,
    version: VERSION.v1,
    type: record.type,
    vaultId: record.vaultId,
    data: recordData,
    folder: record.folder || null,
    isFavorite: record.isFavorite,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  })
}
