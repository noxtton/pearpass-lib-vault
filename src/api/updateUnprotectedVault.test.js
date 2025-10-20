jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultGet: jest.fn(),
    activeVaultClose: jest.fn(),
    hashPassword: jest.fn(),
    encryptVaultKeyWithHashedPassword: jest.fn(),
    decryptVaultKey: jest.fn(),
    vaultsAdd: jest.fn(),
    activeVaultInit: jest.fn(),
    activeVaultAdd: jest.fn()
  }
}))
jest.mock('./checkVaultIsProtected', () => ({
  checkVaultIsProtected: jest.fn()
}))
jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))
jest.mock('./initActiveVaultWithCredentials', () => ({
  initActiveVaultWithCredentials: jest.fn()
}))

const { pearpassVaultClient: mockClient } = require('../instances')
const {
  checkVaultIsProtected: mockCheckVaultIsProtected
} = require('./checkVaultIsProtected')
const {
  getMasterPasswordEncryption: mockGetMasterPasswordEncryption
} = require('./getMasterPasswordEncryption')
const {
  initActiveVaultWithCredentials: mockInitActiveVaultWithCredentials
} = require('./initActiveVaultWithCredentials')
const { updateVault } = require('./updateVault')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('updateVault', () => {
  test('throws if vault id is missing', async () => {
    await expect(updateVault({}, 'pwd')).rejects.toThrow('Vault id is required')
    expect(mockClient.activeVaultGetStatus).not.toHaveBeenCalled()
  })

  test('updates vault with new password and uses current vault encryption when protected', async () => {
    const masterEnc = {
      hashedPassword: 'hp-master',
      ciphertext: 'ct-master',
      nonce: 'nonce-master'
    }
    mockGetMasterPasswordEncryption.mockResolvedValue(masterEnc)
    mockClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    const currentVault = {
      id: 'curr-id',
      encryption: {
        ciphertext: 'ct-cur',
        nonce: 'nonce-cur',
        salt: 'salt-cur',
        hashedPassword: 'hp-cur'
      }
    }
    mockClient.activeVaultGet.mockResolvedValue(currentVault)
    mockClient.activeVaultClose.mockResolvedValue()

    mockClient.hashPassword.mockResolvedValue({
      hashedPassword: 'hp-new',
      salt: 'salt-new'
    })
    mockClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'ct-new',
      nonce: 'nonce-new'
    })
    mockClient.decryptVaultKey.mockResolvedValue('enc-key-new')

    mockClient.vaultsAdd.mockResolvedValue()
    mockClient.activeVaultInit.mockResolvedValue()
    mockClient.activeVaultAdd.mockResolvedValue()

    mockCheckVaultIsProtected.mockResolvedValue(true)
    mockInitActiveVaultWithCredentials.mockResolvedValue()

    const inputVault = { id: 'new-id', name: 'VaultName' }
    await updateVault(inputVault, 'new-pass')

    expect(mockClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(mockClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(mockClient.activeVaultClose).toHaveBeenCalled()

    expect(mockClient.hashPassword).toHaveBeenCalledWith('new-pass')
    expect(mockClient.encryptVaultKeyWithHashedPassword).toHaveBeenCalledWith(
      'hp-new'
    )
    expect(mockClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: 'hp-new',
      ciphertext: 'ct-new',
      nonce: 'nonce-new'
    })

    expect(mockClient.vaultsAdd).toHaveBeenCalledWith('vault/new-id', {
      id: 'new-id',
      name: 'VaultName',
      encryption: {
        ciphertext: 'ct-new',
        nonce: 'nonce-new',
        salt: 'salt-new',
        hashedPassword: 'hp-new'
      }
    })

    expect(mockClient.activeVaultInit).toHaveBeenCalledWith({
      id: 'new-id',
      encryptionKey: 'enc-key-new'
    })
    expect(mockClient.activeVaultAdd).toHaveBeenCalledWith('vault', {
      id: 'new-id',
      name: 'VaultName',
      encryption: {
        ciphertext: 'ct-new',
        nonce: 'nonce-new',
        salt: 'salt-new',
        hashedPassword: 'hp-new'
      }
    })

    expect(mockCheckVaultIsProtected).toHaveBeenCalledWith('curr-id')
    expect(mockInitActiveVaultWithCredentials).toHaveBeenCalledWith(
      'curr-id',
      currentVault.encryption
    )
  })

  test('updates vault without new password and uses master encryption when not protected', async () => {
    const masterEnc = {
      hashedPassword: 'hp-master',
      ciphertext: 'ct-master',
      nonce: 'nonce-master'
    }
    mockGetMasterPasswordEncryption.mockResolvedValue(masterEnc)
    mockClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    const currentVault = {
      id: 'curr-id',
      encryption: {
        ciphertext: 'x',
        nonce: 'y',
        salt: 'z',
        hashedPassword: 'w'
      }
    }
    mockClient.activeVaultGet.mockResolvedValue(currentVault)
    mockClient.activeVaultClose.mockResolvedValue()

    mockClient.decryptVaultKey.mockResolvedValue('enc-key-master')

    mockClient.vaultsAdd.mockResolvedValue()
    mockClient.activeVaultInit.mockResolvedValue()
    mockClient.activeVaultAdd.mockResolvedValue()

    mockCheckVaultIsProtected.mockResolvedValue(false)
    mockInitActiveVaultWithCredentials.mockResolvedValue()

    const inputVault = {
      id: 'id2',
      title: 'Existing',
      encryption: { keep: 'as-is' }
    }
    await updateVault(inputVault)

    expect(mockClient.hashPassword).not.toHaveBeenCalled()
    expect(mockClient.encryptVaultKeyWithHashedPassword).not.toHaveBeenCalled()
    expect(mockClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: 'hp-master',
      ciphertext: 'ct-master',
      nonce: 'nonce-master'
    })

    expect(mockClient.vaultsAdd).toHaveBeenCalledWith('vault/id2', inputVault)
    expect(mockClient.activeVaultInit).toHaveBeenCalledWith({
      id: 'id2',
      encryptionKey: 'enc-key-master'
    })
    expect(mockClient.activeVaultAdd).toHaveBeenCalledWith('vault', inputVault)

    expect(mockCheckVaultIsProtected).toHaveBeenCalledWith('curr-id')
    expect(mockInitActiveVaultWithCredentials).toHaveBeenCalledWith(
      'curr-id',
      masterEnc
    )
  })
})
