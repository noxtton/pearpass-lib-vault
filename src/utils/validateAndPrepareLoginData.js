import { Validator } from 'pear-apps-utils-validator'

import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'

export const loginSchema = Validator.object({
  title: Validator.string().required(),
  username: Validator.string(),
  password: Validator.string(),
  note: Validator.string(),
  websites: Validator.array().items(Validator.string().required()),
  customFields: Validator.array().items(customFieldSchema)
})

export const validateAndPrepareLoginData = (login) => {
  const loginData = {
    title: login.title,
    username: login.username,
    password: login.password,
    note: login.note,
    websites: login.websites,
    customFields: validateAndPrepareCustomFields(login.customFields)
  }

  const errors = loginSchema.validate(loginData)

  if (errors) {
    throw new Error(`Invalid login data: ${JSON.stringify(errors, null, 2)}`)
  }

  return loginData
}
