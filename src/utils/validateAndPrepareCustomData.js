import { Validator } from 'pearpass-lib-validator'

import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'

export const customSchema = Validator.object({
  title: Validator.string().required(),
  customFields: Validator.array().items(customFieldSchema)
})

export const validateAndPrepareCustomData = (custom) => {
  const customData = {
    title: custom.title,
    customFields: validateAndPrepareCustomFields(custom.customFields)
  }

  const errors = customSchema.validate(customData)

  if (errors) {
    throw new Error(`Invalid custom data: ${JSON.stringify(errors, null, 2)}`)
  }

  return customData
}
