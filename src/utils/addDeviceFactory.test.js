import { addDeviceFactory } from './addDeviceFactory'
import { generateUniqueId } from './generateUniqueId'
import { validateAndPrepareDevice } from './validateAndPrepareDevice'

jest.mock('./generateUniqueId', () => ({
  generateUniqueId: jest.fn()
}))

jest.mock('./validateAndPrepareDevice', () => ({
  validateAndPrepareDevice: jest.fn()
}))

describe('addDeviceFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(1749848117883)
  })

  it('should add a device with correct fields and call dependencies', () => {
    const mockId = '123-abc'
    const payload = {
      name: 'ios'
    }
    const vaultId = 'vault-456'

    generateUniqueId.mockReturnValue(mockId)
    validateAndPrepareDevice.mockImplementation((device) => device)

    const result = addDeviceFactory(payload, vaultId)

    expect(generateUniqueId).toHaveBeenCalled()
    expect(validateAndPrepareDevice).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockId,
        vaultId,
        data: 'ios',
        createdAt: 1749848117883
      })
    )

    expect(result.id).toBe(mockId)
    expect(result.vaultId).toBe(vaultId)
    expect(result.createdAt).toBe(1749848117883)
  })
})
