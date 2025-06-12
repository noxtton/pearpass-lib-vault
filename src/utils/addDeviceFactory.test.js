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
  })

  it('should add a device with correct fields and call dependencies', () => {
    const mockId = '123-abc'
    const payload = {
      data: { content: 'Hello' }
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
        data: { content: 'Hello' }
      })
    )

    expect(result.id).toBe(mockId)
    expect(result.vaultId).toBe(vaultId)
    expect(result.createdAt).toBeGreaterThan(0)
    expect(result.updatedAt).toBeGreaterThanOrEqual(result.createdAt)
  })

  it('should default folder to null and isFavorite to false', () => {
    const mockId = '789-def'
    const payload = {
      data: { username: 'test' }
    }
    const vaultId = 'vault-999'

    generateUniqueId.mockReturnValue(mockId)
    validateAndPrepareDevice.mockImplementation((device) => device)

    const result = addDeviceFactory(payload, vaultId)

    expect(result.folder).toBeNull()
    expect(result.isFavorite).toBe(false)
  })
})
