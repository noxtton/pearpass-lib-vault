import { checkPasswordCreated } from './checkPasswordCreated'
import { getMasterPasswordEncryption } from '../api/getMasterPasswordEncryption'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

jest.mock('../api/getMasterPasswordEncryption')
jest.mock('../utils/hasAllEncryptionData')

describe('checkPasswordCreated', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call getMasterPasswordEncryption', async () => {
    getMasterPasswordEncryption.mockResolvedValue({})
    hasAllEncryptionData.mockReturnValue(true)

    await checkPasswordCreated()(jest.fn(), jest.fn)

    expect(getMasterPasswordEncryption).toHaveBeenCalledTimes(1)
  })

  it('should call hasAllEncryptionData with the result from getMasterPasswordEncryption', async () => {
    const mockEncryptionData = { salt: 'test-salt', iv: 'test-iv' }
    getMasterPasswordEncryption.mockResolvedValue(mockEncryptionData)
    hasAllEncryptionData.mockReturnValue(true)

    await checkPasswordCreated()(jest.fn(), jest.fn)

    expect(hasAllEncryptionData).toHaveBeenCalledWith(mockEncryptionData)
  })

  it('should return true when hasAllEncryptionData returns true', async () => {
    getMasterPasswordEncryption.mockResolvedValue({})
    hasAllEncryptionData.mockReturnValue(true)

    const result = await checkPasswordCreated()(jest.fn(), jest.fn)

    expect(result.payload).toBe(true)
  })

  it('should return false when hasAllEncryptionData returns false', async () => {
    getMasterPasswordEncryption.mockResolvedValue({})
    hasAllEncryptionData.mockReturnValue(false)

    const result = await checkPasswordCreated()(jest.fn(), jest.fn)

    expect(result.payload).toBe(false)
  })
})
