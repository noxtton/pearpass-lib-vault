describe('updateUnprotectedVault', () => {
  const setup = (options = {}) => {
    jest.resetModules()

    const validateReturns = options.validateReturns ?? null
    let validateMock

    jest.doMock('pear-apps-utils-validator', () => {
      validateMock = jest.fn().mockReturnValue(validateReturns)
      const chain = { required: jest.fn().mockReturnThis() }
      return {
        Validator: {
          object: jest.fn(() => ({ validate: validateMock })),
          string: jest.fn(() => chain),
          number: jest.fn(() => chain)
        }
      }
    })

    const getUnprotectedVaultByIdMock = jest.fn()
    const updateVaultApiMock = jest.fn()

    jest.doMock('../api/getUnprotectedVaultById', () => ({
      getUnprotectedVaultById: getUnprotectedVaultByIdMock
    }))
    jest.doMock('../api/updateVault', () => ({
      updateVault: updateVaultApiMock
    }))

    jest.doMock('@reduxjs/toolkit', () => ({
      createAsyncThunk:
        (type, payloadCreator) => (arg) => async (dispatch, getState, extra) =>
          payloadCreator(arg, { dispatch, getState, extra })
    }))

    let updateUnprotectedVault
    jest.isolateModules(() => {
      updateUnprotectedVault =
        require('./updateUnprotectedVault').updateUnprotectedVault
    })

    return {
      updateUnprotectedVault,
      getUnprotectedVaultByIdMock: require('../api/getUnprotectedVaultById')
        .getUnprotectedVaultById,
      updateVaultApiMock: require('../api/updateVault').updateVault,
      validateMock
    }
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('calls updateVault API with merged vault data and new password', async () => {
    const {
      updateUnprotectedVault,
      getUnprotectedVaultByIdMock,
      updateVaultApiMock
    } = setup({ validateReturns: null })

    const baseVault = {
      id: 'old-id',
      name: 'Old Name',
      version: 2,
      createdAt: 1000,
      updatedAt: 2000
    }
    getUnprotectedVaultByIdMock.mockResolvedValue(baseVault)

    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(987654321)

    const dispatch = jest.fn()
    const getState = jest.fn()

    await updateUnprotectedVault({
      vaultId: 'v123',
      name: 'New Name',
      newPassword: 'secret'
    })(dispatch, getState)

    expect(getUnprotectedVaultByIdMock).toHaveBeenCalledWith('v123')
    expect(updateVaultApiMock).toHaveBeenCalledTimes(1)
    expect(updateVaultApiMock).toHaveBeenCalledWith(
      {
        id: 'v123',
        name: 'New Name',
        version: 2,
        createdAt: 1000,
        updatedAt: 987654321
      },
      'secret'
    )

    nowSpy.mockRestore()
  })

  it('throws when schema validation fails and does not call updateVault API', async () => {
    const {
      updateUnprotectedVault,
      getUnprotectedVaultByIdMock,
      updateVaultApiMock
    } = setup({
      validateReturns: [{ path: 'name', message: 'required' }]
    })

    getUnprotectedVaultByIdMock.mockResolvedValue({
      id: 'any',
      name: 'Any',
      version: 1,
      createdAt: 1,
      updatedAt: 1
    })

    jest.spyOn(Date, 'now').mockReturnValue(123)

    const thunk = updateUnprotectedVault({
      vaultId: 'x',
      name: 'bad',
      newPassword: 'pw'
    })

    await expect(thunk(jest.fn(), jest.fn())).rejects.toThrow(
      /Invalid vault data:/
    )
    expect(updateVaultApiMock).not.toHaveBeenCalled()
  })
})
