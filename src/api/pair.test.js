import { pair } from './pair'
import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    decryptVaultKey: jest.fn(),
    pair: jest.fn(),
    encryptVaultWithKey: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultGet: jest.fn(),
    vaultsAdd: jest.fn()
  }
}))

jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))

describe('pair', () => {
  const mockInviteCode = 'test-invite-code'
  const mockMasterEncryption = {
    hashedPassword: 'hashed-password',
    ciphertext: 'master-ciphertext',
    nonce: 'master-nonce'
  }
  const mockMasterEncryptionKey = 'master-encryption-key'
  const mockVaultId = 'vault-id'
  const mockEncryptionKey = 'encryption-key'
  const mockEncryptResult = {
    ciphertext: 'new-ciphertext',
    nonce: 'new-nonce'
  }
  const mockVault = { name: 'Test Vault' }

  beforeEach(() => {
    jest.clearAllMocks()

    getMasterPasswordEncryption.mockResolvedValue(mockMasterEncryption)
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(
      mockMasterEncryptionKey
    )
    pearpassVaultClient.pair.mockResolvedValue({
      vaultId: mockVaultId,
      encryptionKey: mockEncryptionKey
    })
    pearpassVaultClient.encryptVaultWithKey.mockResolvedValue(mockEncryptResult)
    pearpassVaultClient.activeVaultGet.mockResolvedValue(mockVault)
  })

  it('should successfully pair with invite code and return vault ID', async () => {
    const result = await pair(mockInviteCode)

    expect(getMasterPasswordEncryption).toHaveBeenCalled()
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: mockMasterEncryption.hashedPassword,
      ciphertext: mockMasterEncryption.ciphertext,
      nonce: mockMasterEncryption.nonce
    })
    expect(pearpassVaultClient.pair).toHaveBeenCalledWith(mockInviteCode)
    expect(pearpassVaultClient.encryptVaultWithKey).toHaveBeenCalledWith(
      mockMasterEncryption.hashedPassword,
      mockEncryptionKey
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: mockVaultId,
      encryptionKey: mockEncryptionKey
    })
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${mockVaultId}`,
      {
        ...mockVault,
        encryption: {
          ciphertext: mockEncryptResult.ciphertext,
          nonce: mockEncryptResult.nonce
        }
      }
    )
    expect(result).toBe(mockVaultId)
  })

  it('should throw error when vault key decryption fails', async () => {
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

    await expect(pair(mockInviteCode)).rejects.toThrow(
      'Failed to decrypt vault key for pairing'
    )

    expect(getMasterPasswordEncryption).toHaveBeenCalled()
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalled()
    expect(pearpassVaultClient.pair).not.toHaveBeenCalled()
  })
})
