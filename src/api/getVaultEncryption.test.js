import { getVaultEncryption } from './getVaultEncryption'
import { pearpassVaultClient } from '../instances'

describe('getVaultEncryption', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize encryption if status is not available', async () => {
    const vaultId = 'test-vault-id'
    const mockEncryptionData = { key: 'test-key', iv: 'test-iv' }
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionInit.mockResolvedValue({})
    pearpassVaultClient.encryptionGet.mockResolvedValue(mockEncryptionData)

    const result = await getVaultEncryption(vaultId)

    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.encryptionInit).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.encryptionGet).toHaveBeenCalledWith(
      `vault/${vaultId}`
    )
    expect(result).toEqual(mockEncryptionData)
  })

  it('should not initialize encryption if status is available', async () => {
    const vaultId = 'test-vault-id'
    const mockEncryptionData = { key: 'test-key', iv: 'test-iv' }
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.encryptionGet.mockResolvedValue(mockEncryptionData)

    const result = await getVaultEncryption(vaultId)

    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.encryptionInit).not.toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGet).toHaveBeenCalledWith(
      `vault/${vaultId}`
    )
    expect(result).toEqual(mockEncryptionData)
  })

  it('should handle undefined status response correctly', async () => {
    const vaultId = 'test-vault-id'
    const mockEncryptionData = { key: 'test-key', iv: 'test-iv' }
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue(undefined)
    pearpassVaultClient.encryptionInit.mockResolvedValue({})
    pearpassVaultClient.encryptionGet.mockResolvedValue(mockEncryptionData)

    const result = await getVaultEncryption(vaultId)

    expect(pearpassVaultClient.encryptionInit).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.encryptionGet).toHaveBeenCalledWith(
      `vault/${vaultId}`
    )
    expect(result).toEqual(mockEncryptionData)
  })
})
