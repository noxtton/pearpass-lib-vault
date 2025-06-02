import { authoriseCurrentProtectedVault } from './authoriseCurrentProtectedVault'
import { getCurrentVault } from './getCurrentVault'
import { getVaultEncryption } from './getVaultEncryption'
import { pearpassVaultClient } from '../instances'

jest.mock('./getCurrentVault')
jest.mock('./getVaultEncryption')
jest.mock('../instances', () => ({
  pearpassVaultClient: {
    getDecryptionKey: jest.fn()
  }
}))

describe('authoriseCurrentProtectedVault', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true when password is correct', async () => {
    getCurrentVault.mockResolvedValue({ id: 'vault-123' })
    getVaultEncryption.mockResolvedValue({
      hashedPassword: 'hashed-password-123',
      salt: 'salt-123'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue(
      'hashed-password-123'
    )

    const result = await authoriseCurrentProtectedVault('correct-password')

    expect(getCurrentVault).toHaveBeenCalledTimes(1)
    expect(getVaultEncryption).toHaveBeenCalledWith('vault-123')
    expect(pearpassVaultClient.getDecryptionKey).toHaveBeenCalledWith({
      salt: 'salt-123',
      password: 'correct-password'
    })
    expect(result).toBe(true)
  })

  it('should throw an error when password is incorrect', async () => {
    getCurrentVault.mockResolvedValue({ id: 'vault-123' })
    getVaultEncryption.mockResolvedValue({
      hashedPassword: 'hashed-password-123',
      salt: 'salt-123'
    })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue(
      'wrong-hashed-password'
    )

    await expect(
      authoriseCurrentProtectedVault('wrong-password')
    ).rejects.toThrow('Invalid password')

    expect(getCurrentVault).toHaveBeenCalledTimes(1)
    expect(getVaultEncryption).toHaveBeenCalledWith('vault-123')
    expect(pearpassVaultClient.getDecryptionKey).toHaveBeenCalledWith({
      salt: 'salt-123',
      password: 'wrong-password'
    })
  })

  it('should propagate errors from getCurrentVault', async () => {
    const error = new Error('Failed to get current vault')
    getCurrentVault.mockRejectedValue(error)

    await expect(authoriseCurrentProtectedVault('password')).rejects.toThrow(
      error
    )
  })

  it('should propagate errors from getVaultEncryption', async () => {
    getCurrentVault.mockResolvedValue({ id: 'vault-123' })
    const error = new Error('Failed to get vault encryption')
    getVaultEncryption.mockRejectedValue(error)

    await expect(authoriseCurrentProtectedVault('password')).rejects.toThrow(
      error
    )
  })

  it('should propagate errors from getDecryptionKey', async () => {
    getCurrentVault.mockResolvedValue({ id: 'vault-123' })
    getVaultEncryption.mockResolvedValue({
      hashedPassword: 'hashed-password-123',
      salt: 'salt-123'
    })
    const error = new Error('Failed to get decryption key')
    pearpassVaultClient.getDecryptionKey.mockRejectedValue(error)

    await expect(authoriseCurrentProtectedVault('password')).rejects.toThrow(
      error
    )
  })
})
