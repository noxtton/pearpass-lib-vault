import { Validator } from 'pear-apps-utils-validator'

import { logger } from './logger'

export const deviceSchema = Validator.object({
  id: Validator.string().required(),
  vaultId: Validator.string().required(),
  createdAt: Validator.number().required()
})

export const validateAndPrepareDevice = (device) => {
  const preparedDevice = {
    id: device.id,
    vaultId: device.vaultId,
    data: device.data,
    createdAt: device.createdAt
  }

  const errors = deviceSchema.validate(preparedDevice)

  if (errors) {
    logger.error(`Invalid device data: ${JSON.stringify(errors, null, 2)}`)

    throw new Error(`Invalid device data: ${JSON.stringify(errors, null, 2)}`)
  }

  return preparedDevice
}
