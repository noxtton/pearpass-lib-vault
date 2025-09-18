import { updateVault } from './updateVault'
import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultClose: jest.fn(),
    encryptVaultKeyWithHashedPassword: jest.fn(),
    decryptVaultKey: jest.fn(),
    activeVaultInit: jest.fn(),
    vaultsAdd: jest.fn(),
    activeVaultAdd: jest.fn()
  }
}))

jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))

describe('updateVault', () => {
  const mockVault = {
    id: 'vault123',
    name: 'Test Vault'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if vault id is missing', async () => {
    await expect(updateVault({ name: 'Test Vault' })).rejects.toThrow(
      'Vault id is required'
    )
  })

  it('closes the active vault if it is open', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    getMasterPasswordEncryption.mockResolvedValue({
      hashedPassword: 'hashedPassword123'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'ciphertext123',
      nonce: 'nonce123'
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey123')

    await updateVault(mockVault)

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
  })

  it('does not close the active vault if it is not open', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    getMasterPasswordEncryption.mockResolvedValue({
      hashedPassword: 'hashedPassword123'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'ciphertext123',
      nonce: 'nonce123'
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey123')

    await updateVault(mockVault)

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
  })

  it('initializes the active vault and updates the vault', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    getMasterPasswordEncryption.mockResolvedValue({
      hashedPassword: 'hashedPassword123'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'ciphertext123',
      nonce: 'nonce123'
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey123')

    await updateVault(mockVault)

    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: mockVault.id,
      encryptionKey: 'encryptionKey123'
    })
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${mockVault.id}`,
      mockVault
    )
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      mockVault
    )
  })
})
