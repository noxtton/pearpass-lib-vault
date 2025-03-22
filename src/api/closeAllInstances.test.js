import { pearpassVaultClient } from '../instances'
import { closeAllInstances } from './closeAllInstances'

describe('closeAllInstances', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should close active vault if active', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: false })

    const result = await closeAllInstances()

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionClose).not.toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('should close vaults if active', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: false })

    const result = await closeAllInstances()

    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsClose).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionClose).not.toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('should close encryption if active', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: true })

    const result = await closeAllInstances()

    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionClose).toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('should close all instances if all are active', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: true })

    const result = await closeAllInstances()

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsClose).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionClose).toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('should not close any instances if all are inactive', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue({ status: false })

    const result = await closeAllInstances()

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionClose).not.toHaveBeenCalled()
    expect(result).toBe(true)
  })

  it('should handle null encryption status', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.vaultsGetStatus.mockResolvedValue({ status: false })
    pearpassVaultClient.encryptionGetStatus.mockResolvedValue(null)

    const result = await closeAllInstances()

    expect(pearpassVaultClient.encryptionGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.encryptionClose).not.toHaveBeenCalled()
    expect(result).toBe(true)
  })
})
