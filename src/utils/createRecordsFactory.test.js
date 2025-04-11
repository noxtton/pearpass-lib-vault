import { createRecordsFactory } from './createRecordsFactory'
import { generateUniqueId } from './generateUniqueId'
import { validateAndPrepareRecord } from './validateAndPrepareRecord'

// Mock the dependencies
jest.mock('./generateUniqueId', () => ({
  generateUniqueId: jest.fn()
}))
jest.mock('./validateAndPrepareRecord', () => ({
  validateAndPrepareRecord: jest.fn()
}))

describe('createRecordsFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a record with correct fields and call dependencies', () => {
    const mockId = '123-abc'
    const payload = {
      type: 'note',
      data: { content: 'Hello' },
      folder: 'folder1',
      isFavorite: true
    }
    const vaultId = 'vault-456'

    // Stub generateUniqueId and validateAndPrepareRecord
    generateUniqueId.mockReturnValue(mockId)
    validateAndPrepareRecord.mockImplementation((record) => record)

    const result = createRecordsFactory(payload, vaultId)

    expect(generateUniqueId).toHaveBeenCalled()
    expect(validateAndPrepareRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockId,
        type: 'note',
        vaultId,
        data: { content: 'Hello' },
        folder: 'folder1',
        isFavorite: true
      })
    )

    // Check some fields more specifically
    expect(result.id).toBe(mockId)
    expect(result.vaultId).toBe(vaultId)
    expect(result.createdAt).toBeGreaterThan(0)
    expect(result.updatedAt).toBeGreaterThanOrEqual(result.createdAt)
  })

  it('should default folder to null and isFavorite to false', () => {
    const mockId = '789-def'
    const payload = {
      type: 'login',
      data: { username: 'test' }
    }
    const vaultId = 'vault-999'

    generateUniqueId.mockReturnValue(mockId)
    validateAndPrepareRecord.mockImplementation((record) => record)

    const result = createRecordsFactory(payload, vaultId)

    expect(result.folder).toBeNull()
    expect(result.isFavorite).toBe(false)
  })
})
