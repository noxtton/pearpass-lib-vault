import { updateRecord } from './updateRecord'
import { pearpassVaultClient } from '../instances'

describe('updateRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call activeVaultAdd with the correct parameters', async () => {
    const record = { id: '123', vaultId: '456' }
    pearpassVaultClient.activeVaultAdd.mockResolvedValueOnce()

    await updateRecord(record)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      `record/${record.id}`,
      record
    )
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(1)
  })

  it('should throw an error when activeVaultAdd fails', async () => {
    const record = { id: '123', vaultId: '456' }
    const error = new Error('Failed to update record')
    pearpassVaultClient.activeVaultAdd.mockRejectedValueOnce(error)

    await expect(updateRecord(record)).rejects.toThrow(error)
  })

  it('should handle records with additional properties', async () => {
    const record = {
      id: '123',
      vaultId: '456',
      name: 'Test Record',
      username: 'testuser',
      password: 'secret',
      url: 'https://example.com'
    }
    pearpassVaultClient.activeVaultAdd.mockResolvedValueOnce()

    await updateRecord(record)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      `record/${record.id}`,
      record
    )
  })

  it('should handle record with UUID format id', async () => {
    const record = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      vaultId: '456'
    }
    pearpassVaultClient.activeVaultAdd.mockResolvedValueOnce()

    await updateRecord(record)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      `record/${record.id}`,
      record
    )
  })
})
