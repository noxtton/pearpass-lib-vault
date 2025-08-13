import { updateVault } from './updateVault'
import { checkVaultIsProtected } from '../api/checkVaultIsProtected'
import { getVaultById } from '../api/getVaultById'
import { updateProtectedVault } from '../api/updateProtectedVault'
import { updateVault as updateVaultApi } from '../api/updateVault'

jest.mock('../api/updateProtectedVault')
jest.mock('../api/updateVault')
jest.mock('../api/getVaultById')
jest.mock('../api/checkVaultIsProtected')

describe('updateVault thunk without redux-mock-store', () => {
  const FIXED_TIMESTAMP = 1600000000000

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(FIXED_TIMESTAMP)
  })

  it('throws an error when getVaultById fails', async () => {
    const dispatch = jest.fn((action) => action)
    const getState = jest.fn()

    getVaultById.mockRejectedValue(new Error('Failed to fetch vault'))

    const thunk = updateVault({
      vaultId: '1',
      name: 'Test Vault',
      newPassword: 'newPass',
      currentPassword: 'oldPass'
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
    expect(resultAction.error.message).toBe('Failed to fetch vault')
  })

  it('throws an error when checkVaultIsProtected fails', async () => {
    const baseVault = {
      id: '1',
      name: 'Test Vault',
      version: 1,
      records: [],
      createdAt: 123456,
      updatedAt: 123456
    }

    getVaultById.mockResolvedValue(baseVault)
    checkVaultIsProtected.mockImplementation(() => {
      throw new Error('Failed to check protection status')
    })

    const dispatch = jest.fn((action) => action)
    const getState = jest.fn()

    const thunk = updateVault({
      vaultId: baseVault.id,
      name: baseVault.name,
      newPassword: 'newPass',
      currentPassword: 'oldPass'
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
    expect(resultAction.error.message).toBe('Failed to check protection status')
  })

  it('throws an error when updateProtectedVault fails', async () => {
    const baseVault = {
      id: '1',
      name: 'Test Vault',
      version: 1,
      records: [],
      createdAt: 123456,
      updatedAt: 123456
    }

    getVaultById.mockResolvedValue(baseVault)
    checkVaultIsProtected.mockReturnValue(true)
    updateProtectedVault.mockRejectedValue(
      new Error('Failed to update protected vault')
    )

    const dispatch = jest.fn((action) => action)
    const getState = jest.fn()

    const thunk = updateVault({
      vaultId: baseVault.id,
      name: baseVault.name,
      newPassword: 'newPass',
      currentPassword: 'oldPass'
    })
    const resultAction = await thunk(dispatch, getState, undefined)

    expect(updateProtectedVault).toHaveBeenCalled()
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
    expect(resultAction.error.message).toBe('Failed to update protected vault')
  })

  it('throws an error when updateVaultApi fails', async () => {
    const baseVault = {
      id: '1',
      name: 'Test Vault',
      version: 1,
      records: [],
      createdAt: 123456,
      updatedAt: 123456
    }

    getVaultById.mockResolvedValue(baseVault)
    checkVaultIsProtected.mockReturnValue(false)
    updateVaultApi.mockRejectedValue(new Error('Failed to update vault'))

    const dispatch = jest.fn((action) => action)
    const getState = jest.fn()

    const thunk = updateVault({
      vaultId: baseVault.id,
      name: baseVault.name,
      newPassword: '',
      currentPassword: ''
    })
    const resultAction = await thunk(dispatch, getState, undefined)

    expect(updateProtectedVault).not.toHaveBeenCalled()
    expect(updateVaultApi).toHaveBeenCalled()

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ type: updateVault.pending.type })
    )
    expect(dispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ type: updateVault.rejected.type })
    )

    expect(resultAction.type).toBe(updateVault.rejected.type)
    expect(resultAction.error.message).toBe('Failed to update vault')
  })

  it('calls updateProtectedVault when newPassword is provided', async () => {
    const baseVault = {
      id: '1',
      name: 'Test Vault',
      version: 1,
      records: [],
      createdAt: 123456,
      updatedAt: 123456
    }

    updateProtectedVault.mockResolvedValue()
    updateVaultApi.mockResolvedValue()
    getVaultById.mockResolvedValue(baseVault)
    checkVaultIsProtected.mockReturnValue(true)

    const dispatch = jest.fn((action) => action)
    const getState = jest.fn()

    const thunk = updateVault({
      vaultId: baseVault.id,
      name: baseVault.name,
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
