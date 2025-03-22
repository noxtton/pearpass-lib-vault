import { pair } from './pair'
import { pearpassVaultClient } from '../instances'

describe('pair', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call pearpassVaultClient.pair with the provided invite code', async () => {
    const mockInviteCode = 'test-invite-code'
    const mockVaultResponse = { id: 'vault-123' }

    pearpassVaultClient.pair.mockResolvedValueOnce(mockVaultResponse)

    const result = await pair(mockInviteCode)

    expect(pearpassVaultClient.pair).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.pair).toHaveBeenCalledWith(mockInviteCode)
    expect(result).toBe(mockVaultResponse)
  })

  it('should propagate errors from pearpassVaultClient.pair', async () => {
    const mockInviteCode = 'test-invite-code'
    const mockError = new Error('Pairing failed')

    pearpassVaultClient.pair.mockRejectedValueOnce(mockError)

    await expect(pair(mockInviteCode)).rejects.toThrow(mockError)
    expect(pearpassVaultClient.pair).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.pair).toHaveBeenCalledWith(mockInviteCode)
  })
})
