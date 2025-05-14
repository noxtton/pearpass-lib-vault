import { updateProtectedVault } from './updateProtectedVault'
import { pearpassVaultClient } from '../instances'
import { getVaultEncryption } from './getVaultEncryption'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultClose: jest.fn(),
    hashPassword: jest.fn(),
    getDecryptionKey: jest.fn(),
    encryptVaultKeyWithHashedPassword: jest.fn(),
    decryptVaultKey: jest.fn(),
    vaultsAdd: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultAdd: jest.fn()
  }
}))

jest.mock('./getVaultEncryption', () => ({
  getVaultEncryption: jest.fn()
}))

describe('updateProtectedVault', () => {
  const vault = { id: 'vault-id', name: 'Test Vault' }
  const newPassword = 'new-password'
  const currentPassword = 'current-password'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if vault id is not provided', async () => {
    await expect(
      updateProtectedVault({ vault: {}, newPassword, currentPassword })
    ).rejects.toThrow('Vault id is required')
  })

  it('closes the active vault if it is open', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.hashPassword.mockResolvedValue({
      hashedPassword: 'hashed-new-password',
      salt: 'new-salt'
    })
    getVaultEncryption.mockResolvedValue({
      hashedPassword: 'hashed-current-password',
      salt: 'current-salt'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue(
      'hashed-current-password'
    )
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce'
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryption-key')

    await updateProtectedVault({ vault, newPassword, currentPassword })

    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
  })

  it('throws an error if the current password is invalid', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    getVaultEncryption.mockResolvedValue({
      hashedPassword: 'hashed-current-password',
      salt: 'current-salt'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('wrong-password')

    await expect(
      updateProtectedVault({ vault, newPassword, currentPassword })
    ).rejects.toThrow('Invalid password')
  })

  it('updates the vault with new encryption details', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.hashPassword.mockResolvedValue({
      hashedPassword: 'hashed-new-password',
      salt: 'new-salt'
    })
    getVaultEncryption.mockResolvedValue({
      hashedPassword: 'hashed-current-password',
      salt: 'current-salt'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue(
      'hashed-current-password'
    )
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'ciphertext',
      nonce: 'nonce'
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryption-key')

    await updateProtectedVault({ vault, newPassword, currentPassword })

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      {
        ...vault,
        encryption: {
          ciphertext: 'ciphertext',
          nonce: 'nonce',
          salt: 'new-salt',
          hashedPassword: 'hashed-new-password'
        }
      }
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: 'encryption-key'
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      `vault`,
      vault
    )
  })
})
