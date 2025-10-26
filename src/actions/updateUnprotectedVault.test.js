const { __getLastValidated } = require('pear-apps-utils-validator')

const { updateUnprotectedVault } = require('./updateUnprotectedVault')
const { getVaultByIdAndClose } = require('../api/getVaultByIdAndClose')
const { updateVault: updateVaultApi } = require('../api/updateVault')

jest.mock('pear-apps-utils-validator', () => {
  let lastValidated = null
  return {
    __getLastValidated: () => lastValidated,
    Validator: {
      object: (schema) => ({
        validate: (val) => {
          lastValidated = val
          const required = Object.keys(schema || {})
          const missing = required.filter(
            (k) => val[k] === undefined || val[k] === null
          )
          return missing.length
            ? missing.map((k) => ({ field: k, message: 'required' }))
            : undefined
        }
      }),
      string: () => ({ required: () => ({}) }),
      number: () => ({ required: () => ({}) })
    }
  }
})

jest.mock('../api/getVaultByIdAndClose', () => ({
  getVaultByIdAndClose: jest.fn()
}))

jest.mock('../api/updateVault', () => ({
  updateVault: jest.fn()
}))

describe('updateUnprotectedVault', () => {
  const fixedNow = 1700000000000
  let dateSpy

  const validVault = {
    id: 'old-id',
    name: 'Old Name',
    version: 1,
    createdAt: 111,
    updatedAt: 222
  }

  beforeEach(() => {
    jest.clearAllMocks()
    dateSpy = jest.spyOn(Date, 'now').mockReturnValue(fixedNow)
  })

  afterEach(() => {
    dateSpy.mockRestore()
  })

  const runThunk = async (payload) => {
    const dispatch = jest.fn((action) => action)
    const getState = jest.fn()
    const resultAction = await updateUnprotectedVault(payload)(
      dispatch,
      getState,
      undefined
    )
    return { dispatch, getState, resultAction }
  }

  test('calls APIs and passes validated new vault with overridden fields', async () => {
    getVaultByIdAndClose.mockResolvedValue(validVault)
    updateVaultApi.mockResolvedValue(undefined)

    const payload = {
      vaultId: 'new-id',
      name: 'New Name',
      newPassword: 'secret'
    }
    const { dispatch, resultAction } = await runThunk(payload)

    expect(getVaultByIdAndClose).toHaveBeenCalledTimes(1)
    expect(getVaultByIdAndClose).toHaveBeenCalledWith('new-id')

    const expectedNewVault = {
      id: 'new-id',
      name: 'New Name',
      version: 1,
      createdAt: 111,
      updatedAt: fixedNow
    }

    expect(updateVaultApi).toHaveBeenCalledTimes(1)
    expect(updateVaultApi).toHaveBeenCalledWith(expectedNewVault, 'secret')

    // Validator received the correct object
    expect(__getLastValidated()).toEqual(expectedNewVault)

    // Dispatch flow: pending -> fulfilled
    expect(dispatch).toHaveBeenCalled()
    expect(dispatch.mock.calls[0][0].type).toBe('vault/updateVault/pending')
    expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0].type).toBe(
      'vault/updateVault/fulfilled'
    )
    expect(resultAction.type).toBe('vault/updateVault/fulfilled')
  })

  test('rejects when validation fails and does not call updateVault API', async () => {
    // Missing "version" will cause validation error in our mock
    getVaultByIdAndClose.mockResolvedValue({
      id: 'anything',
      name: 'Old Name',
      createdAt: 111,
      updatedAt: 222
    })

    const payload = { vaultId: 'some-id', name: 'Name', newPassword: 'pwd' }
    const { dispatch, resultAction } = await runThunk(payload)

    expect(updateVaultApi).not.toHaveBeenCalled()

    // Dispatch flow: pending -> rejected
    expect(dispatch.mock.calls[0][0].type).toBe('vault/updateVault/pending')
    expect(dispatch.mock.calls[dispatch.mock.calls.length - 1][0].type).toBe(
      'vault/updateVault/rejected'
    )
    expect(resultAction.type).toBe('vault/updateVault/rejected')

    // Error message contains validation details
    expect(resultAction.error && resultAction.error.message).toMatch(
      /Invalid vault data/
    )
    expect(resultAction.error && resultAction.error.message).toMatch(/version/)

    // Even on validation, the constructed object passed to validate has overridden fields
    const validated = __getLastValidated()
    expect(validated.id).toBe('some-id')
    expect(validated.name).toBe('Name')
    expect(validated.updatedAt).toBe(fixedNow)
  })

  test('rejects when updateVault API fails', async () => {
    getVaultByIdAndClose.mockResolvedValue(validVault)
    updateVaultApi.mockRejectedValue(new Error('network error'))

    const payload = { vaultId: 'v-123', name: 'X', newPassword: 'pwd' }
    const { resultAction } = await runThunk(payload)

    expect(resultAction.type).toBe('vault/updateVault/rejected')
    expect(resultAction.error && resultAction.error.message).toBe(
      'network error'
    )
  })
})
