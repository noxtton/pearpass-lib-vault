describe('updateProtectedVault', () => {
  let pearpassVaultClientMock
  let checkVaultIsProtectedMock
  let getMasterPasswordEncryptionMock
  let getVaultEncryptionMock
  let initActiveVaultWithCredentialsMock

  const vault = { id: 'vault123', name: 'Test Vault' }
  const currentPassword = 'currentPass'
  const newPassword = 'newPass'

  beforeEach(() => {
    pearpassVaultClientMock = {
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
    checkVaultIsProtectedMock = jest.fn()
    getMasterPasswordEncryptionMock = jest.fn()
    getVaultEncryptionMock = jest.fn()
    initActiveVaultWithCredentialsMock = jest.fn()

    jest.resetModules()
    jest.doMock('../instances', () => ({
      pearpassVaultClient: pearpassVaultClientMock
    }))
    jest.doMock('./checkVaultIsProtected', () => ({
      checkVaultIsProtected: checkVaultIsProtectedMock
    }))
    jest.doMock('./getMasterPasswordEncryption', () => ({
      getMasterPasswordEncryption: getMasterPasswordEncryptionMock
    }))
    jest.doMock('./getVaultEncryption', () => ({
      getVaultEncryption: getVaultEncryptionMock
    }))
    jest.doMock('./initActiveVaultWithCredentials', () => ({
      initActiveVaultWithCredentials: initActiveVaultWithCredentialsMock
    }))
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.dontMock('../instances')
    jest.dontMock('./checkVaultIsProtected')
    jest.dontMock('./getMasterPasswordEncryption')
    jest.dontMock('./getVaultEncryption')
    jest.dontMock('./initActiveVaultWithCredentials')
  })

  const getUpdateProtectedVault = async () => {
    const { updateProtectedVault } = await import('./updateProtectedVault')
    return updateProtectedVault
  }

  it('throws if vault id is missing', async () => {
    const updateProtectedVault = await getUpdateProtectedVault()
    await expect(
      updateProtectedVault({ vault: {}, currentPassword })
    ).rejects.toThrow('Vault id is required')
  })

  it('throws if password is invalid', async () => {
    getMasterPasswordEncryptionMock.mockResolvedValue({ master: true })
    getVaultEncryptionMock.mockResolvedValue({
      salt: 'salt',
      hashedPassword: 'hashed1',
      ciphertext: 'ct',
      nonce: 'n'
    })
    pearpassVaultClientMock.activeVaultGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClientMock.activeVaultGet.mockResolvedValue({
      id: 'vaultOld',
      encryption: {}
    })
    pearpassVaultClientMock.getDecryptionKey.mockResolvedValue('wrongHashed')
    const updateProtectedVault = await getUpdateProtectedVault()
    await expect(
      updateProtectedVault({ vault, currentPassword })
    ).rejects.toThrow('Invalid password')
  })

  it('updates vault with new password', async () => {
    getMasterPasswordEncryptionMock.mockResolvedValue({ master: true })
    getVaultEncryptionMock.mockResolvedValue({
      salt: 'salt',
      hashedPassword: 'hashed1',
      ciphertext: 'ct',
      nonce: 'n'
    })
    pearpassVaultClientMock.activeVaultGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClientMock.activeVaultGet.mockResolvedValue({
      id: 'vaultOld',
      encryption: {}
    })
    pearpassVaultClientMock.getDecryptionKey.mockResolvedValue('hashed1')
    pearpassVaultClientMock.hashPassword.mockResolvedValue({
      hashedPassword: 'hashed2',
      salt: 'salt2'
    })
    pearpassVaultClientMock.encryptVaultKeyWithHashedPassword.mockResolvedValue(
      { ciphertext: 'ct2', nonce: 'n2' }
    )
    pearpassVaultClientMock.decryptVaultKey.mockResolvedValue('encryptionKey')
    checkVaultIsProtectedMock.mockResolvedValue(true)
    initActiveVaultWithCredentialsMock.mockResolvedValue()
    pearpassVaultClientMock.vaultsAdd.mockResolvedValue()
    pearpassVaultClientMock.activeVaultInit.mockResolvedValue()
    pearpassVaultClientMock.activeVaultAdd.mockResolvedValue()
    const updateProtectedVault = await getUpdateProtectedVault()
    await updateProtectedVault({ vault, currentPassword, newPassword })
    expect(pearpassVaultClientMock.hashPassword).toHaveBeenCalledWith(
      newPassword
    )
    expect(
      pearpassVaultClientMock.encryptVaultKeyWithHashedPassword
    ).toHaveBeenCalledWith('hashed2')
    expect(pearpassVaultClientMock.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      expect.objectContaining({
        ...vault,
        encryption: expect.objectContaining({
          hashedPassword: 'hashed2',
          salt: 'salt2',
          ciphertext: 'ct2',
          nonce: 'n2'
        })
      })
    )
    expect(pearpassVaultClientMock.activeVaultInit).toHaveBeenCalledWith({
      id: vault.id,
      encryptionKey: 'encryptionKey'
    })
    expect(initActiveVaultWithCredentialsMock).toHaveBeenCalled()
  })

  it('updates vault without new password', async () => {
    getMasterPasswordEncryptionMock.mockResolvedValue({ master: true })
    getVaultEncryptionMock.mockResolvedValue({
      salt: 'salt',
      hashedPassword: 'hashed1',
      ciphertext: 'ct',
      nonce: 'n'
    })
    pearpassVaultClientMock.activeVaultGetStatus.mockResolvedValue({
      status: true
    })
    pearpassVaultClientMock.activeVaultGet.mockResolvedValue({
      id: 'vaultOld',
      encryption: {}
    })
    pearpassVaultClientMock.getDecryptionKey.mockResolvedValue('hashed1')
    pearpassVaultClientMock.decryptVaultKey.mockResolvedValue('encryptionKey')
    checkVaultIsProtectedMock.mockResolvedValue(false)
    initActiveVaultWithCredentialsMock.mockResolvedValue()
    pearpassVaultClientMock.vaultsAdd.mockResolvedValue()
    pearpassVaultClientMock.activeVaultInit.mockResolvedValue()
    pearpassVaultClientMock.activeVaultAdd.mockResolvedValue()
    const updateProtectedVault = await getUpdateProtectedVault()
    await updateProtectedVault({ vault, currentPassword })
    expect(pearpassVaultClientMock.hashPassword).not.toHaveBeenCalled()
    expect(pearpassVaultClientMock.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      expect.objectContaining({
        ...vault,
        encryption: expect.objectContaining({
          hashedPassword: 'hashed1',
          salt: 'salt',
          ciphertext: 'ct',
          nonce: 'n'
        })
      })
    )
    expect(initActiveVaultWithCredentialsMock).toHaveBeenCalled()
  })
})
