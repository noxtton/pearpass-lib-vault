import { init } from './init'
import { pearpassVaultClient } from '../instances'

describe('init', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true if vault is already initialized', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })

    const result = await init('password')

    expect(result).toBe(true)
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.encryptionAdd).not.toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsInit).not.toHaveBeenCalled()
  })

  it('should throw an error if password is not provided and vault not initialized', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })

    await expect(init()).rejects.toThrow('Password is required')
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.encryptionAdd).not.toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsInit).not.toHaveBeenCalled()
  })

  it('should initialize vault with password when not yet initialized', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionAdd.mockResolvedValue({})
    pearpassVaultClient.vaultsInit.mockResolvedValue({})

    const password = 'testPassword'
    const result = await init(password)

    expect(result).toBe(true)
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.encryptionAdd).toHaveBeenCalledWith(
      'encryptionData',
      {
        TESTpassword: password
      }
    )
    expect(pearpassVaultClient.vaultsInit).toHaveBeenCalledWith(password)
  })

  it('should handle when vaultsGetStatus returns undefined', async () => {
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue(undefined)

    const password = 'testPassword'
    const result = await init(password)

    expect(result).toBe(true)
    expect(pearpassVaultClient.encryptionAdd).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsInit).toHaveBeenCalled()
  })
})
