import { Validator } from 'pearpass-lib-validator'

import {
  customFieldSchema,
  validateAndPrepareCustomFields
} from './validateAndPrepareCustomFields'

export const noteSchema = Validator.object({
  title: Validator.string().required(),
  note: Validator.string(),
  customFields: Validator.array().items(customFieldSchema)
})

export const validateAndPrepareNoteData = (note) => {
  const noteData = {
    title: note.title,
    note: note.note,
    customFields: validateAndPrepareCustomFields(note.customFields)
  }

  const errors = noteSchema.validate(noteData)

  if (errors) {
    throw new Error(`Invalid note data: ${JSON.stringify(errors, null, 2)}`)
  }

  return noteData
}
