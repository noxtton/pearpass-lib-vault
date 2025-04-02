import { createVault } from './createVault'
import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))
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
    hasAllEncryptionData.mockReturnValue(false)
  })

  it('should close active vault if one exists before creating new vault', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    hasAllEncryptionData.mockReturnValue(true)
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt',
      decryptionKey: 'decryptionKey'
    })

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
    hasAllEncryptionData.mockReturnValue(true)
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt',
      decryptionKey: 'decryptionKey'
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
    hasAllEncryptionData.mockReturnValue(true)
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      salt: 'salt',
      decryptionKey: 'decryptionKey'
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
    hasAllEncryptionData.mockReturnValue(true)
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'encrypted-data',
      nonce: 'nonce-value',
      salt: 'salt-value',
      decryptionKey: 'decryptionKey'
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

    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      ciphertext: encryptVaultKeyResult.ciphertext,
      nonce: encryptVaultKeyResult.nonce,
      decryptionKey: 'decryptionKey'
    })
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: 'decrypted-key'
    })
  })
})
