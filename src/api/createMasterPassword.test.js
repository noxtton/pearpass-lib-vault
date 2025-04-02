import { createMasterPassword } from './createMasterPassword'
import { pearpassVaultClient } from '../instances'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    encryptionGetStatus: jest.fn(),
    encryptionInit: jest.fn(),
    encryptionGet: jest.fn(),
    encryptVaultKey: jest.fn(),
    encryptionAdd: jest.fn(),
    vaultsGetStatus: jest.fn(),
    decryptVaultKey: jest.fn(),
    vaultsInit: jest.fn(),
    vaultsAdd: jest.fn(),
    vaultsClose: jest.fn(),
    encryptionAdd: jest.fn()
  }
}))

jest.mock('../utils/hasAllEncryptionData', () => ({
  hasAllEncryptionData: jest.fn()
}))

describe('createMasterPassword', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize encryption if status is not available', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: null })
    pearpassVaultClient.encryptionGet.mockResolvedValue(null)
    pearpassVaultClient.encryptVaultKey.mockResolvedValue({
      someData: 'value',
      decryptionKey: 'key'
    })
    hasAllEncryptionData.mockReturnValue(true)

    await createMasterPassword('testPassword')

    expect(pearpassVaultClient.encryptionInit).toHaveBeenCalled()
  })

  it('should not initialize encryption if status is available', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClient.encryptionGet.mockResolvedValue(null)
    pearpassVaultClient.encryptVaultKey.mockResolvedValue({
      someData: 'value',
      decryptionKey: 'key'
    })
    hasAllEncryptionData.mockReturnValue(true)

    await createMasterPassword('testPassword')

    expect(pearpassVaultClient.encryptionInit).not.toHaveBeenCalled()
  })

  it('should throw error if master password already exists', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClient.encryptionGet.mockResolvedValue({ existingData: true })

    await expect(createMasterPassword('testPassword')).rejects.toThrow(
      'Master password already exists'
    )

    expect(pearpassVaultClient.encryptVaultKey).not.toHaveBeenCalled()
  })

  it('should throw error if encryption of vault key fails', async () => {
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClient.encryptionGet.mockResolvedValue(null)
    pearpassVaultClient.encryptVaultKey.mockResolvedValue({ someData: 'value' })
    hasAllEncryptionData.mockReturnValue(false)

    await expect(createMasterPassword('testPassword')).rejects.toThrow(
      'Error encrypting vault key'
    )

    expect(pearpassVaultClient.encryptionAdd).not.toHaveBeenCalled()
  })

  it('should encrypt and add master password successfully', async () => {
    const mockEncryptionResult = {
      encrypted: undefined,
      salt: 'salt',
      iv: undefined,
      decryptionKey: 'key'
    }
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClient.encryptionGet.mockResolvedValue(null)
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)
    pearpassVaultClient.encryptVaultKey.mockResolvedValue(mockEncryptionResult)
    hasAllEncryptionData.mockReturnValue(true)

    await createMasterPassword('testPassword')

    expect(pearpassVaultClient.encryptVaultKey).toHaveBeenCalledWith(
      'testPassword'
    )
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      'masterEncryption',
      {
        ciphertext: mockEncryptionResult.encrypted,
        nonce: mockEncryptionResult.iv,
        salt: mockEncryptionResult.salt,
        decryptionKey: mockEncryptionResult.decryptionKey
      }
    )
    expect(pearpassVaultClient.encryptionAdd).toHaveBeenCalledWith(
      'masterPassword',
      {
        ciphertext: mockEncryptionResult.encrypted,
        nonce: mockEncryptionResult.iv,
        salt: mockEncryptionResult.salt
      }
    )
  })
})
