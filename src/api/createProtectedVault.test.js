import { createProtectedVault } from './createProtectedVault'
import { pearpassVaultClient } from '../instances'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultClose: jest.fn(),
    encryptVaultKey: jest.fn(),
    decryptVaultKey: jest.fn(),
    vaultsAdd: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultAdd: jest.fn()
  }
}))

jest.mock('../utils/hasAllEncryptionData', () => ({
  hasAllEncryptionData: jest.fn()
}))

describe('createProtectedVault', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if vault id is not provided', async () => {
    await expect(createProtectedVault({}, 'password')).rejects.toThrow(
      'Vault id is required'
    )
    await expect(createProtectedVault(null, 'password')).rejects.toThrow(
      'Vault id is required'
    )
    await expect(createProtectedVault(undefined, 'password')).rejects.toThrow(
      'Vault id is required'
    )
  })

  it('throws an error if encryption fails', async () => {
    const vault = { id: 'test-id', name: 'Test Vault' }
    const password = 'test-password'

    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.encryptVaultKey.mockResolvedValue({
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value'
    })

    hasAllEncryptionData.mockReturnValue(false)

    await expect(createProtectedVault(vault, password)).rejects.toThrow(
      'Error encrypting vault key'
    )
  })

  it('closes active vault if one exists', async () => {
    const vault = { id: 'test-id', name: 'Test Vault' }
    const password = 'test-password'

    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.encryptVaultKey.mockResolvedValue({
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value',
      decryptionKey: 'decryption-key'
    })

    hasAllEncryptionData.mockReturnValue(true)
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryption-key')

    await createProtectedVault(vault, password)

    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
  })

  it('successfully creates a protected vault', async () => {
    const vault = { id: 'test-id', name: 'Test Vault' }
    const password = 'test-password'
    const encryptionData = {
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value',
      decryptionKey: 'decryption-key'
    }

    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.encryptVaultKey.mockResolvedValue(encryptionData)
    hasAllEncryptionData.mockReturnValue(true)
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryption-key')

    await createProtectedVault(vault, password)

    expect(pearpassVaultClient.encryptVaultKey).toHaveBeenCalledWith(password)
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      decryptionKey: 'decryption-key',
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value'
    })
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      {
        ...vault,
        encryption: encryptionData
      }
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: 'encryption-key'
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      vault
    )
  })
})
