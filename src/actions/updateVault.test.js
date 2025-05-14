import { updateVault } from './updateVault'
import { updateProtectedVault } from '../api/updateProtectedVault'
import { updateVault as updateVaultApi } from '../api/updateVault'

jest.mock('../api/updateProtectedVault')
jest.mock('../api/updateVault')

describe('updateVault thunk without redux-mock-store', () => {
  const FIXED_TIMESTAMP = 1600000000000

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_TIMESTAMP)
  })

  afterAll(() => {
    Date.now.mockRestore()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls updateProtectedVault when newPassword is provided', async () => {
    updateProtectedVault.mockResolvedValue()
    updateVaultApi.mockResolvedValue()

    const dispatch = jest.fn((action) => action)
    const getState = jest.fn()

    const baseVault = {
      id: '1',
      name: 'Test Vault',
      version: 1,
      records: [],
      createdAt: 123456,
      updatedAt: 123456
    }

    const thunk = updateVault({
      vault: baseVault,
      newPassword: 'newPass',
      currentPassword: 'oldPass'
    })
    const resultAction = await thunk(dispatch, getState, undefined)

    const expectedVault = { ...baseVault, updatedAt: FIXED_TIMESTAMP }

    expect(updateProtectedVault).toHaveBeenCalledWith({
      vault: expectedVault,
      newPassword: 'newPass',
      currentPassword: 'oldPass'
    })
    expect(updateVaultApi).not.toHaveBeenCalled()

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: updateVault.pending.type })
    )
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: updateVault.fulfilled.type,
        payload: expectedVault
      })
    )

    expect(resultAction.type).toBe(updateVault.fulfilled.type)
    expect(resultAction.payload).toEqual(expectedVault)
  })

  it('calls updateVaultApi when no newPassword is provided', async () => {
    updateProtectedVault.mockResolvedValue()
    updateVaultApi.mockResolvedValue()

    const dispatch = jest.fn((action) => action)
    const getState = jest.fn()

    const baseVault = {
      id: '1',
      name: 'Test Vault',
      version: 1,
      records: [],
      createdAt: 123456,
      updatedAt: 123456
    }

    const thunk = updateVault({
      vault: baseVault,
      newPassword: '',
      currentPassword: ''
    })
    const resultAction = await thunk(dispatch, getState, undefined)

    const expectedVault = { ...baseVault, updatedAt: FIXED_TIMESTAMP }

    expect(updateVaultApi).toHaveBeenCalledWith(expectedVault)
    expect(updateProtectedVault).not.toHaveBeenCalled()

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: updateVault.pending.type })
    )
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: updateVault.fulfilled.type,
        payload: expectedVault
      })
    )

    expect(resultAction.type).toBe(updateVault.fulfilled.type)
    expect(resultAction.payload).toEqual(expectedVault)
  })

  it('rejects when vault data is invalid', async () => {
    const dispatch = jest.fn((action) => action)
    const getState = jest.fn()

    const invalidVault = {
      id: '1',
      version: 1,
      records: [],
      createdAt: 123456,
      updatedAt: 123456
    }

    const thunk = updateVault({
      vault: invalidVault,
      newPassword: '',
      currentPassword: ''
    })
    const resultAction = await thunk(dispatch, getState, undefined)

    expect(updateProtectedVault).not.toHaveBeenCalled()
    expect(updateVaultApi).not.toHaveBeenCalled()

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: updateVault.pending.type })
    )
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ type: updateVault.rejected.type })
    )

    expect(resultAction.type).toBe(updateVault.rejected.type)
    expect(resultAction.error.message).toMatch(/Invalid vault data:/)
  })
})
