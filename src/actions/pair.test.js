import { pair } from './pair'
import { pair as pairApi } from '../api/pair'

jest.mock('../api/pair', () => ({
  pair: jest.fn()
}))

jest.mock('../utils/validateInviteCode', () => ({
  validateInviteCode: jest.fn()
}))

describe('pair', () => {
  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()
    pairApi.mockResolvedValue({ id: 'test-vault' })
  })

  it('should call pairApi with the invite code', async () => {
    const inviteCode = 'test-code'
    const thunk = pair(inviteCode)
    await thunk(dispatch, getState)

    expect(pairApi).toHaveBeenCalledWith(inviteCode)
  })

  it('should return the vault id from pairApi', async () => {
    pairApi.mockResolvedValue('test-vault')

    const thunk = pair('test-code')
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual('test-vault')
  })

  it('should handle errors from pairApi', async () => {
    const errorMessage = 'Pairing failed'
    pairApi.mockRejectedValue(new Error(errorMessage))

    const thunk = pair('test-code')
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(pair.rejected.type)
    expect(result.error.message).toContain(errorMessage)
  })
})
