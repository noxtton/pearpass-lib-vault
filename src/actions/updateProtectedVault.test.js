const { checkVaultIsProtected } = require('../api/checkVaultIsProtected')
const {
  getMasterPasswordEncryption
} = require('../api/getMasterPasswordEncryption')
const { getVaultEncryption } = require('../api/getVaultEncryption')
const {
  initActiveVaultWithCredentials
} = require('../api/initActiveVaultWithCredentials')
const { updateProtectedVault } = require('../api/updateProtectedVault')
const { pearpassVaultClient } = require('../instances')

jest.mock('../instances', () => ({
  pearpassVaultClient: {
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
}))
jest.mock('../api/checkVaultIsProtected', () => ({
  checkVaultIsProtected: jest.fn()
}))
jest.mock('../api/getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))
jest.mock('../api/getVaultEncryption', () => ({
  getVaultEncryption: jest.fn()
}))
jest.mock('../api/initActiveVaultWithCredentials', () => ({
  initActiveVaultWithCredentials: jest.fn()
}))

describe('updateProtectedVault', () => {
  const defaultCurrentVault = {
    id: 'current-vault',
    encryption: {
      hashedPassword: 'cur_hp',
      salt: 'cur_salt',
      ciphertext: 'cur_ct',
      nonce: 'cur_nonce'
    }
  }
  const defaultUpdatingVaultEncryption = {
    hashedPassword: 'old_hp',
    salt: 'old_salt',
    ciphertext: 'old_ct',
    nonce: 'old_nonce'
  }
  const masterEncryption = {
    hashedPassword: 'master_hp',
    salt: 'master_salt',
    ciphertext: 'master_ct',
    nonce: 'master_nonce'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet.mockImplementation(async (key) => {
      if (key === 'vault') return { ...defaultCurrentVault }
      return null
    })
    pearpassVaultClient.activeVaultClose.mockResolvedValue()

    getVaultEncryption.mockResolvedValue({ ...defaultUpdatingVaultEncryption })
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('old_hp')
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('encryptionKey123')
    pearpassVaultClient.vaultsAdd.mockResolvedValue()
    pearpassVaultClient.activeVaultInit.mockResolvedValue()
    pearpassVaultClient.activeVaultAdd.mockResolvedValue()

    getMasterPasswordEncryption.mockResolvedValue({ ...masterEncryption })
    checkVaultIsProtected.mockResolvedValue(true)
    initActiveVaultWithCredentials.mockResolvedValue()

    pearpassVaultClient.hashPassword.mockResolvedValue({
      hashedPassword: 'new_hp',
      salt: 'new_salt'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'new_ct',
      nonce: 'new_nonce'
    })
  })

  it('throws if vault id is missing', async () => {
    await expect(
      updateProtectedVault({ vault: {}, currentPassword: 'pw' })
    ).rejects.toThrow('Vault id is required')

    expect(pearpassVaultClient.vaultsAdd).not.toHaveBeenCalled()
  })

  it('throws on invalid current password', async () => {
    pearpassVaultClient.getDecryptionKey.mockResolvedValue('not_matching_hp')

    await expect(
      updateProtectedVault({
        vault: { id: 'v1', name: 'Vault 1' },
        currentPassword: 'wrong'
      })
    ).rejects.toThrow('Invalid password')

    expect(pearpassVaultClient.vaultsAdd).not.toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultInit).not.toHaveBeenCalled()
  })

  it('updates vault with a new password and reinitializes to protected current vault', async () => {
    checkVaultIsProtected.mockResolvedValue(true)

    const vault = { id: 'v1', name: 'Vault 1' }
    await updateProtectedVault({
      vault,
      newPassword: 'new_secret',
      currentPassword: 'correct_pw'
    })

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()

    expect(getVaultEncryption).toHaveBeenCalledWith('v1')
    expect(pearpassVaultClient.getDecryptionKey).toHaveBeenCalledWith({
      salt: 'old_salt',
      password: 'correct_pw'
    })
    expect(pearpassVaultClient.hashPassword).toHaveBeenCalledWith('new_secret')
    expect(
      pearpassVaultClient.encryptVaultKeyWithHashedPassword
    ).toHaveBeenCalledWith('new_hp')

    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: 'new_hp',
      ciphertext: 'new_ct',
      nonce: 'new_nonce'
    })

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      'vault/v1',
      expect.objectContaining({
        id: 'v1',
        name: 'Vault 1',
        encryption: expect.objectContaining({
          hashedPassword: 'new_hp',
          salt: 'new_salt',
          ciphertext: 'new_ct',
          nonce: 'new_nonce'
        })
      })
    )

    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: 'v1',
      encryptionKey: 'encryptionKey123'
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      vault
    )

    expect(checkVaultIsProtected).toHaveBeenCalledWith('current-vault')
    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(
      'current-vault',
      defaultCurrentVault.encryption
    )
  })

  it('keeps existing encryption when no new password and uses master encryption if current vault is not protected', async () => {
    checkVaultIsProtected.mockResolvedValue(false)

    const vault = { id: 'v2', name: 'Vault 2' }
    await updateProtectedVault({
      vault,
      currentPassword: 'correct_pw'
    })

    expect(pearpassVaultClient.hashPassword).not.toHaveBeenCalled()
    expect(
      pearpassVaultClient.encryptVaultKeyWithHashedPassword
    ).not.toHaveBeenCalled()

    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: 'old_hp',
      ciphertext: 'old_ct',
      nonce: 'old_nonce'
    })

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      'vault/v2',
      expect.objectContaining({
        id: 'v2',
        name: 'Vault 2',
        encryption: expect.objectContaining({
          hashedPassword: 'old_hp',
          salt: 'old_salt',
          ciphertext: 'old_ct',
          nonce: 'old_nonce'
        })
      })
    )

    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(
      'current-vault',
      masterEncryption
    )
  })
})
