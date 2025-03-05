import { Validator } from 'pear-apps-utils-validator'

import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'

export const identitySchema = Validator.object({
  title: Validator.string().required(),
  fullName: Validator.string(),
  email: Validator.string().email(),
  phoneNumber: Validator.string(),
  address: Validator.string(),
  zip: Validator.string(),
  city: Validator.string(),
  region: Validator.string(),
  country: Validator.string(),
  note: Validator.string(),
  customFields: Validator.array().items(customFieldSchema)
})

export const validateAndPrepareIdentityData = (identity) => {
  const identityData = {
    title: identity.title,
    fullName: identity.fullName,
    email: identity.email,
    phoneNumber: identity.phoneNumber,
    address: identity.address,
    zip: identity.zip,
    city: identity.city,
    region: identity.region,
    country: identity.country,
    note: identity.note,
    customFields: validateAndPrepareCustomFields(identity.customFields)
  }

  const errors = identitySchema.validate(identityData)

  if (errors) {
    throw new Error(`Invalid identity data: ${JSON.stringify(errors, null, 2)}`)
  }

  return identityData
}
