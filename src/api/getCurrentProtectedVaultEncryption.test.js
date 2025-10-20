import { getProtectedVaultEncryption } from './getProtectedVaultEncryption'
import { listVaults } from './listVaults'

jest.mock('./listVaults')

describe('getProtectedVaultEncryption', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return vault encryption data when vault is found', async () => {
    const mockEncryption = {
      salt: 'test-salt',
      ciphertext: 'test-ciphertext',
      nonce: 'test-nonce',
      hashedPassword: 'test-key'
    }

    const mockVaults = [
      {
        id: 'vault-1',
        encryption: mockEncryption
      }
    ]

    listVaults.mockResolvedValue(mockVaults)

    const result = await getProtectedVaultEncryption('vault-1')

    expect(listVaults).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockEncryption)
  })

  it('should throw error when vault is not found', async () => {
    listVaults.mockResolvedValue([
      {
        id: 'vault-1',
        encryption: {}
      }
    ])

    await expect(
      getProtectedVaultEncryption('non-existent-vault')
    ).rejects.toThrow('Vault not found')

    expect(listVaults).toHaveBeenCalledTimes(1)
  })
})
