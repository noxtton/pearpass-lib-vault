import { createVault } from './createVault'
import { pearpassVaultClient } from '../instances'
import { getVaultEncryption } from './getVaultEncryption'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

jest.mock('./getVaultEncryption')
jest.mock('../utils/hasAllEncryptionData')
jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultClose: jest.fn(),
    vaultsAdd: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultAdd: jest.fn(),
    encryptVaultKey: jest.fn(),
    decryptVaultKey: jest.fn(),
    encryptionAdd: jest.fn()
  }
}))

describe('createVault', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getVaultEncryption.mockResolvedValue({})
    hasAllEncryptionData.mockReturnValue(false)
  })

  it('should close active vault if one exists before creating new vault', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })

    const vault = { id: 'test-vault-id' }

    await createVault(vault)

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      vault
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: undefined
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      vault
    )
  })

  it('should not close active vault if none exists before creating new vault', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })

    const vault = { id: 'test-vault-id' }

    await createVault(vault)

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      vault
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: undefined
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      vault
    )
  })

  it('should add vault with proper path structure', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })

    const vault = { id: 'complex-vault-id', name: 'Test Vault' }

    await createVault(vault)

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      vault
    )
  })

  it('should handle encryption when vault has password', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })

    const encryptVaultKeyResult = {
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value'
    }

    pearpassVaultClient.encryptVaultKey.mockResolvedValue(encryptVaultKeyResult)
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('decrypted-key')

    hasAllEncryptionData.mockImplementation(
      (data) => data && data.ciphertext && data.nonce && data.salt
    )

    const vault = { id: 'test-vault-id', password: 'test-password' }

    await createVault(vault)

    expect(getVaultEncryption).toHaveBeenCalledWith(vault.id)
    expect(pearpassVaultClient.encryptVaultKey).toHaveBeenCalledWith(
      vault.password
    )
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      password: vault.password,
      ciphertext: encryptVaultKeyResult.ciphertext,
      nonce: encryptVaultKeyResult.nonce,
      salt: encryptVaultKeyResult.salt
    })
    expect(pearpassVaultClient.encryptionAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      encryptVaultKeyResult
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: 'decrypted-key'
    })
  })

  it('should throw error if vault already exists with encryption data', async () => {
    const vault = { id: 'existing-vault-id', password: 'test-password' }

    getVaultEncryption.mockResolvedValue({
      ciphertext: 'data',
      nonce: 'nonce',
      salt: 'salt'
    })
    hasAllEncryptionData.mockReturnValue(true)

    await expect(createVault(vault)).rejects.toThrow('Vault already exists')
  })

  it('should throw error if vault encryption fails', async () => {
    const vault = { id: 'test-vault-id', password: 'test-password' }

    pearpassVaultClient.encryptVaultKey.mockResolvedValue({
      ciphertext: 'data'
    })
    hasAllEncryptionData.mockReturnValueOnce(false).mockReturnValueOnce(false)

    await expect(createVault(vault)).rejects.toThrow(
      'Error encrypting vault key'
    )
  })
})
