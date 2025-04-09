import { deleteRecord } from './deleteRecord'
import { pearpassVaultClient } from '../instances'

describe('deleteRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call activeVaultRemove with the correct path', async () => {
    const recordId = 'record-123'

    await deleteRecord(recordId)

    expect(pearpassVaultClient.activeVaultRemove).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultRemove).toHaveBeenCalledWith(
      'record/record-123'
    )
  })

  it('should throw an error if activeVaultRemove fails', async () => {
    const recordId = 'record-456'
    const error = new Error('Failed to delete record')
    pearpassVaultClient.activeVaultRemove.mockRejectedValueOnce(error)

    await expect(deleteRecord(recordId)).rejects.toThrow(error)
  })

  it('should throw an error if recordId is not provided', async () => {
    await expect(deleteRecord()).rejects.toThrow('Record ID is required')
  })
})
