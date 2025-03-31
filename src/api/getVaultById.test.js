import { getVaultById } from './getVaultById'
import { getVaultEncryption } from './getVaultEncryption'
import { listVaults } from './listVaults'
import { pearpassVaultClient } from '../instances'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

jest.mock('./listVaults')
jest.mock('./getVaultEncryption')
jest.mock('../instances', () => ({
  pearpassVaultClient: {
    decryptVaultKey: jest.fn(),
    activeVaultGetStatus: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultGet: jest.fn(),
    activeVaultClose: jest.fn()
  }
}))
jest.mock('../utils/hasAllEncryptionData')

describe('getVaultById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('throws error when vault not found', async () => {
    listVaults.mockResolvedValue([{ id: 'other-vault-id' }])

    await expect(getVaultById('non-existent-vault-id')).rejects.toThrow(
      'Vault not found'
    )
    expect(listVaults).toHaveBeenCalledTimes(1)
  })

  test('throws error when encryption data does not exist', async () => {
    listVaults.mockResolvedValue([{ id: 'vault-id' }])
    getVaultEncryption.mockResolvedValue({})
    hasAllEncryptionData.mockReturnValue(false)

    await expect(getVaultById('vault-id', 'password')).rejects.toThrow(
      'Vault encryption data does not exist'
    )
    expect(listVaults).toHaveBeenCalledTimes(1)
    expect(getVaultEncryption).toHaveBeenCalledWith('vault-id')
    expect(hasAllEncryptionData).toHaveBeenCalled()
  })

  test('throws error when decryption fails', async () => {
    listVaults.mockResolvedValue([{ id: 'vault-id' }])
    getVaultEncryption.mockResolvedValue({
      ciphertext: 'cipher',
      nonce: 'nonce',
      salt: 'salt'
    })
    hasAllEncryptionData.mockReturnValue(true)
    pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

    await expect(getVaultById('vault-id', 'password')).rejects.toThrow(
      'Error decrypting vault key'
    )
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      password: 'password',
      ciphertext: 'cipher',
      nonce: 'nonce',
      salt: 'salt'
    })
  })

  test('initializes new vault when no active vault exists', async () => {
    const vaultId = 'vault-id'
    const mockVault = { id: vaultId, name: 'Test Vault' }

    listVaults.mockResolvedValue([{ id: vaultId }])
    getVaultEncryption.mockResolvedValue({
      ciphertext: 'cipher',
      nonce: 'nonce',
      salt: 'salt'
    })
    hasAllEncryptionData.mockReturnValue(true)
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryption-key')
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.activeVaultGet.mockResolvedValue(mockVault)

    const result = await getVaultById(vaultId, 'password')

    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vaultId,
      encryptionKey: 'encryption-key'
    })
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(result).toEqual(mockVault)
  })

  test('returns current vault if it matches requested vault', async () => {
    const vaultId = 'vault-id'
    const mockVault = { id: vaultId, name: 'Test Vault' }

    listVaults.mockResolvedValue([{ id: vaultId }])
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet.mockResolvedValue(mockVault)

    const result = await getVaultById(vaultId)

    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
    expect(result).toEqual(mockVault)
  })

  test('closes current vault and initializes new one if different vault requested', async () => {
    const vaultId = 'new-vault-id'
    const currentVault = { id: 'old-vault-id', name: 'Old Vault' }
    const newVault = { id: vaultId, name: 'New Vault' }

    listVaults.mockResolvedValue([{ id: vaultId }, { id: 'old-vault-id' }])
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet
      .mockResolvedValueOnce(currentVault)
      .mockResolvedValueOnce(newVault)

    const result = await getVaultById(vaultId)

    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: vaultId,
      encryptionKey: undefined
    })
    expect(result).toEqual(newVault)
  })
})
