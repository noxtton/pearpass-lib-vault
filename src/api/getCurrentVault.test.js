import { getCurrentVault } from './getCurrentVault'
import { pearpassVaultClient } from '../instances'
import { logger } from '../utils/logger'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetStatus: jest.fn(),
    activeVaultGet: jest.fn()
  }
}))

jest.mock('../utils/logger', () => ({
  logger: {
    error: jest.fn()
  }
}))

describe('getCurrentVault', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return undefined and log an error if no active vault status is found', async () => {
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValueOnce({
      status: null
    })

    const result = await getCurrentVault()

    expect(result).toBeUndefined()
    expect(logger.error).toHaveBeenCalledWith('No active vault found')
    expect(pearpassVaultClient.activeVaultGet).not.toHaveBeenCalled()
  })

  it('should return the vault data if active vault status is found', async () => {
    const mockVaultData = { id: 'vault-id' }
    pearpassVaultClient.activeVaultGetStatus.mockResolvedValueOnce({
      status: true
    })
    pearpassVaultClient.activeVaultGet.mockResolvedValueOnce(mockVaultData)

    const result = await getCurrentVault()

    expect(result).toEqual(mockVaultData)
    expect(pearpassVaultClient.activeVaultGetStatus).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault')
  })
})
