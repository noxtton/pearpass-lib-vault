import { getVaultById } from './getVaultById'
import { listVaults } from './listVaults'
import { pearpassVaultClient } from '../instances'

jest.mock('./listVaults')

describe('getVaultById', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('throws an error if vault is not found', async () => {
    listVaults.mockResolvedValue([{ id: 'vault1' }, { id: 'vault2' }])

    await expect(getVaultById('nonexistent', 'password')).rejects.toThrow(
      'Vault not found'
    )
    expect(listVaults).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultGetStatus).not.toHaveBeenCalled()
  })

  it('initializes vault if no active vault exists', async () => {
    const vaultId = 'vault1'
    const password = 'password'
    const mockVault = { id: vaultId, name: 'Test Vault' }

    listVaults.mockResolvedValue([{ id: vaultId }])
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({
      status: false
    })
    pearpassVaultClient.activeVaultInit.mockResolvedValue()
    pearpassVaultClient.activeVaultGet.mockResolvedValue(mockVault)

    const result = await getVaultById(vaultId, password)

    expect(listVaults).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith(
      vaultId,
      password
    )
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
    expect(result).toEqual(mockVault)
  })

  it('returns current vault if it matches requested vault ID', async () => {
    const vaultId = 'vault1'
    const password = 'password'
    const mockVault = { id: vaultId, name: 'Test Vault' }

    listVaults.mockResolvedValue([{ id: vaultId }])
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet.mockResolvedValue(mockVault)

    const result = await getVaultById(vaultId, password)

    expect(pearpassVaultClient.activeVaultInit).not.toHaveBeenCalled()
    expect(pearpassVaultClient.activeVaultClose).not.toHaveBeenCalled()
    expect(result).toEqual(mockVault)
  })

  it('switches to new vault if current vault has different ID', async () => {
    const currentVaultId = 'vault1'
    const newVaultId = 'vault2'
    const password = 'password'
    const currentVault = { id: currentVaultId, name: 'Current Vault' }
    const newVault = { id: newVaultId, name: 'New Vault' }

    listVaults.mockResolvedValue([{ id: currentVaultId }, { id: newVaultId }])
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValue({ status: true })
    pearpassVaultClient.activeVaultGet
      .mockResolvedValueOnce(currentVault)
      .mockResolvedValueOnce(newVault)

    const result = await getVaultById(newVaultId, password)

    expect(pearpassVaultClient.activeVaultClose).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultInit).toHaveBeenCalledWith(
      newVaultId,
      password
    )
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledTimes(2)
    expect(result).toEqual(newVault)
  })
})
