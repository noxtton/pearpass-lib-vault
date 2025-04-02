import { getVaultById } from './getVaultById'
import { pearpassVaultClient } from '../instances'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { getVaultEncryption } from './getVaultEncryption'
import { listVaults } from './listVaults'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    getDecryptionKey: jest.fn(),
    decryptVaultKey: jest.fn(),
    activeVaultGetStatus: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultGet: jest.fn(),
    activeVaultClose: jest.fn()
  }
}))

jest.mock('./listVaults', () => ({
  listVaults: jest.fn()
}))

jest.mock('./getVaultEncryption', () => ({
  getVaultEncryption: jest.fn()
}))

jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))

jest.mock('../utils/hasAllEncryptionData', () => ({
  hasAllEncryptionData: jest.fn()
}))

describe('getVaultById', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('throws "Vault not found" error if vault is not in the list', async () => {
    listVaults.mockResolvedValue([{ id: 'otherVault' }])
    await expect(getVaultById('vault1', 'password')).rejects.toThrow(
      'Vault not found'
    )
  })

  describe('when password is provided', () => {
    it('throws error if vault encryption data does not exist', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      getVaultEncryption.mockResolvedValue({})
      hasAllEncryptionData.mockReturnValue(false)

      await expect(getVaultById('vault1', 'password')).rejects.toThrow(
        'Vault encryption data does not exist'
      )
    })

    it('throws error if decryption fails (decryptVaultKey returns falsy)', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      const vaultEncryptionRes = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        salt: 'salt'
      }
      getVaultEncryption.mockResolvedValue(vaultEncryptionRes)
      hasAllEncryptionData.mockReturnValue(true)
      pearpassVaultClient.getDecryptionKey.mockResolvedValue('decryptionKey')
      pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

      await expect(getVaultById('vault1', 'password')).rejects.toThrow(
        'Error decrypting vault key'
      )
    })

    it('initializes the vault if activeVaultGetStatus returns false', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      const vaultEncryptionRes = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        salt: 'salt'
      }
      getVaultEncryption.mockResolvedValue(vaultEncryptionRes)
      hasAllEncryptionData.mockReturnValue(true)
      pearpassVaultClient.getDecryptionKey.mockResolvedValue('decryptionKey')
      pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey')
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: false
      })
      pearpassVaultClient.activeVaultGet.mockResolvedValue({ id: 'vault1' })

      const result = await getVaultById('vault1', 'password')

      expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
        id: 'vault1',
        encryptionKey: 'encryptionKey'
      })
      expect(result).toEqual({ id: 'vault1' })
    })

    it('reinitializes the vault if the current active vault id does not match', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      const vaultEncryptionRes = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        salt: 'salt'
      }
      getVaultEncryption.mockResolvedValue(vaultEncryptionRes)
      hasAllEncryptionData.mockReturnValue(true)
      pearpassVaultClient.getDecryptionKey.mockResolvedValue('decryptionKey')
      pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey')
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: true
      })

      pearpassVaultClient.activeVaultGet
        .mockResolvedValueOnce({ id: 'differentVault' })
        .mockResolvedValueOnce({ id: 'vault1' })

      const result = await getVaultById('vault1', 'password')

      expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()

      expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ id: 'vault1' })
    })

    it('returns the current vault if the active vault id matches', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      const vaultEncryptionRes = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        salt: 'salt'
      }
      getVaultEncryption.mockResolvedValue(vaultEncryptionRes)
      hasAllEncryptionData.mockReturnValue(true)
      pearpassVaultClient.getDecryptionKey.mockResolvedValue('decryptionKey')
      pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey')
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: true
      })
      pearpassVaultClient.activeVaultGet.mockResolvedValue({ id: 'vault1' })

      const result = await getVaultById('vault1', 'password')
      expect(result).toEqual({ id: 'vault1' })
    })
  })

  describe('when no password is provided', () => {
    it('throws error if master encryption data does not exist', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      getMasterPasswordEncryption.mockResolvedValue({})
      hasAllEncryptionData.mockReturnValue(false)

      await expect(getVaultById('vault1')).rejects.toThrow(
        'Master password encryption data does not exist'
      )
    })

    it('throws error if decryption fails (decryptVaultKey returns falsy) for master encryption', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      const masterEncryptionData = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        decryptionKey: 'masterKey'
      }
      getMasterPasswordEncryption.mockResolvedValue(masterEncryptionData)
      hasAllEncryptionData.mockReturnValue(true)
      pearpassVaultClient.decryptVaultKey.mockResolvedValue(null)

      await expect(getVaultById('vault1')).rejects.toThrow(
        'Error decrypting vault key'
      )
    })

    it('returns the current vault if the active vault id matches for master encryption', async () => {
      listVaults.mockResolvedValue([{ id: 'vault1' }])
      const masterEncryptionData = {
        ciphertext: 'cipher',
        nonce: 'nonce',
        decryptionKey: 'masterKey'
      }
      getMasterPasswordEncryption.mockResolvedValue(masterEncryptionData)
      hasAllEncryptionData.mockReturnValue(true)
      pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey')
      pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
        status: true
      })
      pearpassVaultClient.activeVaultGet.mockResolvedValue({ id: 'vault1' })

      const result = await getVaultById('vault1')
      expect(result).toEqual({ id: 'vault1' })
    })
  })
})
