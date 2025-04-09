import { init } from './init'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    vaultsGetStatus: jest.fn(),
    encryptionGet: jest.fn(),
    decryptVaultKey: jest.fn(),
    getDecryptionKey: jest.fn(),
    vaultsInit: jest.fn()
  }
}))

describe('init', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true if vault status is already active', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })

    const result = await init({ password: 'password' })

    expect(result).toBe(true)
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGet).not.toHaveBeenCalled()
  })

  it('should throw error if password is not provided', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })

    await expect(init({})).rejects.toThrow('Password is required')
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalled()
  })

  it('should throw error if vault key decryption fails', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionGet.mockResolvedValue({
      ciphertext: 'test',
      nonce: 'test',
      salt: 'test'
    })

    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('decryption-key')

    await expect(init({ password: 'password' })).rejects.toThrow(
      'Error decrypting vault key'
    )
    expect(pearpassVaultClient.getDecryptionKey).toHaveBeenCalledWith({
      salt: 'test',
      password: 'password'
    })
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      ciphertext: 'test',
      nonce: 'test',
      hashedPassword: 'decryption-key'
    })
  })

  it('should initialize vault and return true on success', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionGet.mockResolvedValue({
      ciphertext: 'test',
      nonce: 'test',
      salt: 'test'
    })

    pearpassVaultClient.decryptVaultKey.mockResolvedValue('decrypted-key')
    pearpassVaultClient.vaultsInit.mockResolvedValue({})

    const result = await init({ password: 'password' })

    expect(result).toBe(true)
    expect(pearpassVaultClient.vaultsInit).toHaveBeenCalledWith('decrypted-key')
  })

  it('should initialize vault with provided encryption data', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('decrypted-key')
    pearpassVaultClient.vaultsInit.mockResolvedValue({})

    const result = await init({
      ciphertext: 'ciphertext',
      nonce: 'nonce',
      hashedPassword: 'decryption-key'
    })

    expect(result).toBe(true)
    expect(pearpassVaultClient.vaultsInit).toHaveBeenCalledWith('decrypted-key')
  })

  it('should throw error if decryption fails with provided encryption data', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

    await expect(
      init({
        ciphertext: 'ciphertext',
        nonce: 'nonce',
        hashedPassword: 'decryption-key'
      })
    ).rejects.toThrow('Error decrypting vault key')
  })
})
