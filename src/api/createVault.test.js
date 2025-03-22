import { createVault } from './createVault'
import { pearpassVaultClient } from '../instances'

describe('createVault', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should close active vault if one exists before creating new vault', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })

    const vault = { id: 'test-vault-id' }

    await createVault(vault)

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      vault
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith(vault.id)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      vault
    )
  })

  it('should not close active vault if none exists before creating new vault', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })

    const vault = { id: 'test-vault-id' }

    await createVault(vault)

    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      vault
    )
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith(vault.id)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault',
      vault
    )
  })

  it('should add vault with proper path structure', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })

    const vault = { id: 'complex-vault-id', name: 'Test Vault' }

    await createVault(vault)

    expect(pearpassVaultClient.vaultsAdd).toHaveBeenCalledWith(
      `vault/${vault.id}`,
      vault
    )
  })
})
