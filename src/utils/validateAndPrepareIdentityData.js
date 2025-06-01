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
  customFields: Validator.array().items(customFieldSchema),
  passportFullName: Validator.string(),
  passportNumber: Validator.string(),
  passportIssuingCountry: Validator.string(),
  passportDateOfIssue: Validator.string(),
  passportExpiryDate: Validator.string(),
  passportNationality: Validator.string(),
  passportDob: Validator.string(),
  passportGender: Validator.string(),
  idCardNumber: Validator.string(),
  idCardDateOfIssue: Validator.string(),
  idCardExpiryDate: Validator.string(),
  idCardIssuingCountry: Validator.string(),
  drivingLicenseNumber: Validator.string(),
  drivingLicenseDateOfIssue: Validator.string(),
  drivingLicenseExpiryDate: Validator.string(),
  drivingLicenseIssuingCountry: Validator.string()
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
    customFields: validateAndPrepareCustomFields(identity.customFields),
    passportFullName: identity.passportFullName,
    passportNumber: identity.passportNumber,
    passportIssuingCountry: identity.passportIssuingCountry,
    passportDateOfIssue: identity.passportDateOfIssue,
    passportExpiryDate: identity.passportExpiryDate,
    passportNationality: identity.passportNationality,
    passportDob: identity.passportDob,
    passportGender: identity.passportGender,
    idCardNumber: identity.idCardNumber,
    idCardDateOfIssue: identity.idCardDateOfIssue,
    idCardExpiryDate: identity.idCardExpiryDate,
    idCardIssuingCountry: identity.idCardIssuingCountry,
    drivingLicenseNumber: identity.drivingLicenseNumber,
    drivingLicenseDateOfIssue: identity.drivingLicenseDateOfIssue,
    drivingLicenseExpiryDate: identity.drivingLicenseExpiryDate,
    drivingLicenseIssuingCountry: identity.drivingLicenseIssuingCountry
  }

  const errors = identitySchema.validate(identityData)

  if (errors) {
    throw new Error(`Invalid identity data: ${JSON.stringify(errors, null, 2)}`)
  }

  return identityData
}
