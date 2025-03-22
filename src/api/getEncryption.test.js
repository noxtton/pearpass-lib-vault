import { getEncryption } from './getEncryption'
import { pearpassVaultClient } from '../instances'

describe('getEncryption', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return encryption data when status is available', async () => {
    const mockEncryptionData = { key: 'data' }
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.encryptionGet.mockResolvedValue(mockEncryptionData)

    const result = await getEncryption()

    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionInit).not.toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGet).toHaveBeenCalledWith(
      'encryptionData'
    )
    expect(result).toEqual(mockEncryptionData)
  })

  it('should initialize encryption when status is not available', async () => {
    const mockEncryptionData = { key: 'initialized-data' }
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionInit.mockResolvedValue({})
    pearpassVaultClient.encryptionGet.mockResolvedValue(mockEncryptionData)

    const result = await getEncryption()

    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionInit).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGet).toHaveBeenCalledWith(
      'encryptionData'
    )
    expect(result).toEqual(mockEncryptionData)
  })

  it('should initialize encryption when status is null', async () => {
    const mockEncryptionData = { key: 'null-status-data' }
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue(null)
    pearpassVaultClient.encryptionInit.mockResolvedValue({})
    pearpassVaultClient.encryptionGet.mockResolvedValue(mockEncryptionData)

    const result = await getEncryption()

    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionInit).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGet).toHaveBeenCalledWith(
      'encryptionData'
    )
    expect(result).toEqual(mockEncryptionData)
  })
})
