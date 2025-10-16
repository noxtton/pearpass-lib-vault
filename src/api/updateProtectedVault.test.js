import { updateProtectedVault } from './updateProtectedVault'
import { pearpassVaultClient } from '../instances'
import { checkVaultIsProtected } from './checkVaultIsProtected'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { getVaultEncryption } from './getVaultEncryption'
import { initActiveVaultWithCredentials } from './initActiveVaultWithCredentials'

jest.mock('../instances', () => {
  const m = {
    activeVaultGetStatus: jest.fn(),
    activeVaultGet: jest.fn(),
    activeVaultClose: jest.fn(),
    getDecryptionKey: jest.fn(),
    hashPassword: jest.fn(),
    encryptVaultKeyWithHashedPassword: jest.fn(),
    decryptVaultKey: jest.fn(),
    vaultsAdd: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultAdd: jest.fn()
  }
  return { pearpassVaultClient: m }
})

jest.mock('./checkVaultIsProtected', () => ({
  checkVaultIsProtected: jest.fn()
}))
jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))
jest.mock('./getVaultEncryption', () => ({
  getVaultEncryption: jest.fn()
}))
jest.mock('./initActiveVaultWithCredentials', () => ({
  initActiveVaultWithCredentials: jest.fn()
}))

describe('updateProtectedVault', () => {
  const masterEnc = {
    ciphertext: 'mc',
    nonce: 'mn',
    salt: 'ms',
    hashedPassword: 'mh'
  }
  const currentVault = {
    id: 'current-id',
    encryption: {
      ciphertext: 'cc',
      nonce: 'cn',
      salt: 'cs',
      hashedPassword: 'ch'
    }
  }
  const originalVaultEnc = {
    ciphertext: 'oc',
    nonce: 'on',
    salt: 'os',
    hashedPassword: 'oh'
  }
  const vault = { id: 'v1', name: 'My Vault' }

  beforeEach(() => {
    jest.clearAllMocks()

    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet.mockResolvedValue(currentVault)
    pearpassVaultClient.activeVaultClose.mockResolvedValue(undefined)

    getMasterPasswordEncryption.mockResolvedValue(masterEnc)
    getVaultEncryption.mockResolvedValue({ ...originalVaultEnc })

    // Simulate correct current password
    pearpassVaultClient.getDecryptionKey.mockResolvedValue(
      originalVaultEnc.hashedPassword
    )

    pearpassVaultClient.hashPassword.mockResolvedValue({
      hashedPassword: 'nh',
      salt: 'ns'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'nc',
      nonce: 'nn'
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('ek')
    pearpassVaultClient.vaultsAdd.mockResolvedValue(undefined)
    pearpassVaultClient.activeVaultInit.mockResolvedValue(undefined)
    pearpassVaultClient.activeVaultAdd.mockResolvedValue(undefined)

    checkVaultIsProtected.mockResolvedValue(true)
    initActiveVaultWithCredentials.mockResolvedValue(undefined)
  })

  test('throws if vault id is missing', async () => {
    await expect(
      updateProtectedVault({ vault: {}, currentPassword: 'x' })
    ).rejects.toThrow('Vault id is required')
  })

  test('throws on invalid current password', async () => {
    pearpassVaultClient.getDecryptionKey.mockResolvedValueOnce('wrong-hash')
    await expect(
      updateProtectedVault({ vault, currentPassword: 'wrong' })
    ).rejects.toThrow('Invalid password')
    expect(pearpassVaultClient.vaultsAdd).not.toHaveBeenCalled()
  })

  test('updates encryption with newPassword and restores previous active vault using its encryption', async () => {
    checkVaultIsProtected.mockResolvedValueOnce(true)

    await updateProtectedVault({
      vault,
      currentPassword: 'correct',
      newPassword: 'new-pass'
    })

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()

    expect(getVaultEncryption).toHaveBeenCalledWith('v1')
    expect(pearpassVaultClient.getDecryptionKey).toHaveBeenCalledWith({
      salt: originalVaultEnc.salt,
      password: 'correct'
    })

    expect(pearpassVaultClient.hashPassword).toHaveBeenCalledWith('new-pass')
    expect(
      pearpassVaultClient.encryptVaultKeyWithHashedPassword
    ).toHaveBeenCalledWith('nh')

    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: 'nh',
      ciphertext: 'nc',
      nonce: 'nn'
    })

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith('vault/v1', {
      ...vault,
      encryption: {
        ciphertext: 'nc',
        nonce: 'nn',
        salt: 'ns',
        hashedPassword: 'nh'
      }
    })

    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: 'v1',
      encryptionKey: 'ek'
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      vault
    )

    expect(checkVaultIsProtected).toHaveBeenCalledWith('current-id')
    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(
      'current-id',
      currentVault.encryption
    )
  })

  test('keeps existing encryption if newPassword not provided and restores using master encryption when not protected', async () => {
    checkVaultIsProtected.mockResolvedValueOnce(false)

    await updateProtectedVault({
      vault,
      currentPassword: 'correct'
    })

    expect(pearpassVaultClient.hashPassword).not.toHaveBeenCalled()
    expect(
      pearpassVaultClient.encryptVaultKeyWithHashedPassword
    ).not.toHaveBeenCalled()

    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: originalVaultEnc.hashedPassword,
      ciphertext: originalVaultEnc.ciphertext,
      nonce: originalVaultEnc.nonce
    })

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith('vault/v1', {
      ...vault,
      encryption: { ...originalVaultEnc }
    })

    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(
      'current-id',
      masterEnc
    )
  })
})
