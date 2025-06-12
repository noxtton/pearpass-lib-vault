import { addDevice as addDeviceApi } from '../api/addDevice'
import { generateUniqueId } from '../utils/generateUniqueId'
import { validateAndPrepareDevice } from '../utils/validateAndPrepareDevice'
import { addDevice } from './addDevice'

jest.mock('../api/addDevice', () => ({
  addDevice: jest.fn()
}))

jest.mock('../utils/generateUniqueId', () => ({
  generateUniqueId: jest.fn()
}))

jest.mock('../utils/validateAndPrepareDevice', () => ({
  validateAndPrepareDevice: jest.fn((device) => device)
}))

describe('addDevice', () => {
  const mockVaultId = 'vault-123'
  const mockDeviceId = 'device-456'
  const mockDate = 1633000000000
  const mockPayload = {
    data: { platform: 'ios', version: '20.6.0' }
  }

  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()

    global.Date.now = jest.fn().mockReturnValue(mockDate)

    generateUniqueId.mockReturnValue(mockDeviceId)

    dispatch = jest.fn()
    getState = jest.fn().mockReturnValue({
      vault: {
        data: {
          id: mockVaultId
        }
      }
    })

    addDeviceApi.mockResolvedValue({})
    validateAndPrepareDevice.mockImplementation((device) => device)
  })

  it('should create a device with correct properties', async () => {
    const thunk = addDevice(mockPayload)
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual({
      id: mockDeviceId,
      vaultId: mockVaultId,
      data: mockPayload.data,
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })

  it('should call addDeviceApi with correct parameters', async () => {
    const thunk = addDevice(mockPayload)
    await thunk(dispatch, getState)

    expect(addDeviceApi).toHaveBeenCalledWith({
      id: mockDeviceId,
      vaultId: mockVaultId,
      data: mockPayload.data,
      createdAt: mockDate,
      updatedAt: mockDate
    })
  })

  it('should throw an error if validation fails', async () => {
    validateAndPrepareDevice.mockImplementation(() => {
      throw new Error('Validation error')
    })

    const thunk = addDevice(mockPayload)

    const result = await thunk(dispatch, getState)

    await expect(result.type).toBe(addDevice.rejected.type)

    expect(addDeviceApi).not.toHaveBeenCalled()
  })

  it('should generate a unique ID for the device', async () => {
    const thunk = addDevice(mockPayload)
    await thunk(dispatch, getState)

    expect(generateUniqueId).toHaveBeenCalled()
  })
})
