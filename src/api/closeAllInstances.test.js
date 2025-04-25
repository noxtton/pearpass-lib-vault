import { pearpassVaultClient } from '../instances'
import { closeAllInstances } from './closeAllInstances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    close: jest.fn()
  }
}))

describe('closeAllInstances', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call pearpassVaultClient.close once', async () => {
    await closeAllInstances()

    expect(pearpassVaultClient.close).toHaveBeenCalledTimes(1)
  })

  it('should resolve without errors', async () => {
    pearpassVaultClient.close.mockResolvedValueOnce()

    await expect(closeAllInstances()).resolves.toBeUndefined()
  })

  it('should handle errors from close method', async () => {
    pearpassVaultClient.close.mockRejectedValueOnce(new Error('Close failed'))

    await expect(closeAllInstances()).rejects.toThrow('Close failed')
  })
})
