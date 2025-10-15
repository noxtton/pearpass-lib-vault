const { pearpassVaultClient } = require('../instances')
const { checkVaultIsProtected } = require('./checkVaultIsProtected')
const { getMasterPasswordEncryption } = require('./getMasterPasswordEncryption')
const {
  initActiveVaultWithCredentials
} = require('./initActiveVaultWithCredentials')
const { updateVault } = require('./updateVault')

jest.mock('../instances', () => {
  const fns = {
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
  return { pearpassVaultClient: fns }
})

jest.mock('./checkVaultIsProtected', () => ({
  checkVaultIsProtected: jest.fn()
}))
jest.mock('./getMasterPasswordEncryption', () => ({
  getMasterPasswordEncryption: jest.fn()
}))
jest.mock('./initActiveVaultWithCredentials', () => ({
  initActiveVaultWithCredentials: jest.fn()
}))

describe('updateVault', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws when vault id is missing', async () => {
    await expect(updateVault({})).rejects.toThrow('Vault id is required')
    await expect(updateVault(undefined)).rejects.toThrow('Vault id is required')
  })

  it('updates vault with new password and restores previous vault using its own encryption when protected', async () => {
    const currentVault = {
      id: 'currentId',
      encryption: {
        ciphertext: 'curCT',
        nonce: 'curNonce',
        salt: 'curSalt',
        hashedPassword: 'curHash'
      }
    }
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet.mockResolvedValue(currentVault)
    pearpassVaultClient.activeVaultClose.mockResolvedValue(undefined)

    getMasterPasswordEncryption.mockResolvedValue({
      hashedPassword: 'masterHash',
      ciphertext: 'masterCT',
      nonce: 'masterNonce'
    })

    pearpassVaultClient.hashPassword.mockResolvedValue({
      hashedPassword: 'newHash',
      salt: 'newSalt'
    })
    pearpassVaultClient.encryptVaultKeyWithHashedPassword.mockResolvedValue({
      ciphertext: 'encCT',
      nonce: 'encNonce'
    })
    pearpassVaultClient.decryptVaultKey.mockResolvedValue('key123')
    pearpassVaultClient.vaultsAdd.mockResolvedValue(undefined)
    pearpassVaultClient.activeVaultInit.mockResolvedValue(undefined)
    pearpassVaultClient.activeVaultAdd.mockResolvedValue(undefined)

    checkVaultIsProtected.mockResolvedValue(true)
    initActiveVaultWithCredentials.mockResolvedValue(undefined)

    await updateVault({ id: 'vault123' }, 'newPass')

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()

    expect(pearpassVaultClient.hashPassword).toHaveBeenCalledWith('newPass')
    expect(
      pearpassVaultClient.encryptVaultKeyWithHashedPassword
    ).toHaveBeenCalledWith('newHash')
    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: 'newHash',
      ciphertext: 'encCT',
      nonce: 'encNonce'
    })

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      'vault/vault123',
      expect.objectContaining({
        id: 'vault123',
        encryption: expect.objectContaining({
          ciphertext: 'encCT',
          nonce: 'encNonce',
          salt: 'newSalt',
          hashedPassword: 'newHash'
        })
      })
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: 'vault123',
      encryptionKey: 'key123'
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      expect.objectContaining({
        id: 'vault123',
        encryption: expect.objectContaining({
          ciphertext: 'encCT',
          nonce: 'encNonce',
          salt: 'newSalt',
          hashedPassword: 'newHash'
        })
      })
    )

    expect(checkVaultIsProtected).toHaveBeenCalledWith('currentId')
    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(
      'currentId',
      currentVault.encryption
    )
  })

  it('updates vault without new password and restores previous vault using master encryption when not protected', async () => {
    const currentVault = { id: 'currentId' }

    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet.mockResolvedValue(currentVault)
    pearpassVaultClient.activeVaultClose.mockResolvedValue(undefined)

    const masterEnc = {
      hashedPassword: 'masterHash',
      ciphertext: 'masterCT',
      nonce: 'masterNonce'
    }
    getMasterPasswordEncryption.mockResolvedValue(masterEnc)

    pearpassVaultClient.decryptVaultKey.mockResolvedValue('keyABC')
    pearpassVaultClient.vaultsAdd.mockResolvedValue(undefined)
    pearpassVaultClient.activeVaultInit.mockResolvedValue(undefined)
    pearpassVaultClient.activeVaultAdd.mockResolvedValue(undefined)

    checkVaultIsProtected.mockResolvedValue(false)
    initActiveVaultWithCredentials.mockResolvedValue(undefined)

    await updateVault({ id: 'vault456' })

    expect(pearpassVaultClient.hashPassword).not.toHaveBeenCalled()
    expect(
      pearpassVaultClient.encryptVaultKeyWithHashedPassword
    ).not.toHaveBeenCalled()

    expect(pearpassVaultClient.decryptVaultKey).toHaveBeenCalledWith({
      hashedPassword: 'masterHash',
      ciphertext: 'masterCT',
      nonce: 'masterNonce'
    })

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      'vault/vault456',
      expect.objectContaining({ id: 'vault456' })
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith({
      id: 'vault456',
      encryptionKey: 'keyABC'
    })
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      expect.objectContaining({ id: 'vault456' })
    )

    expect(checkVaultIsProtected).toHaveBeenCalledWith('currentId')
    expect(initActiveVaultWithCredentials).toHaveBeenCalledWith(
      'currentId',
      masterEnc
    )
  })
})
