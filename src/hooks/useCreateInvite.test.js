import { useDispatch, useSelector } from 'react-redux'

import { useCreateInvite } from './useCreateInvite'
import { createInvite as createInviteAction } from '../actions/createInvite'

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}))

jest.mock('../actions/createInvite', () => ({
  createInvite: jest.fn()
}))

describe('useCreateInvite', () => {
  let mockDispatch

  beforeEach(() => {
    mockDispatch = jest.fn()
    useDispatch.mockReturnValue(mockDispatch)
    useSelector.mockImplementation(() => ({
      isLoading: false,
      data: { inviteId: 'test-invite-id' }
    }))
    createInviteAction.mockReturnValue({ type: 'CREATE_INVITE' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should return the correct data structure', () => {
    const { isLoading, createInvite, data } = useCreateInvite()

    expect(isLoading).toBe(false)
    expect(typeof createInvite).toBe('function')
    expect(data).toEqual({ inviteId: 'test-invite-id' })
  })

  test('should dispatch createInviteAction when createInvite is called', async () => {
    mockDispatch.mockResolvedValue({
      error: false,
      payload: { inviteId: 'new-invite-id' }
    })

    const { createInvite } = useCreateInvite()
    await createInvite()

    expect(createInviteAction).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CREATE_INVITE' })
  })

  test('should call onCompleted callback when action succeeds', async () => {
    const payload = { inviteId: 'success-invite-id' }
    mockDispatch.mockResolvedValue({ error: false, payload })

    const onCompleted = jest.fn()
    const { createInvite } = useCreateInvite({ onCompleted })

    await createInvite()

    expect(onCompleted).toHaveBeenCalledWith(payload)
  })

  test('should not call onCompleted callback when action fails', async () => {
    mockDispatch.mockResolvedValue({ error: true })

    const onCompleted = jest.fn()
    const { createInvite } = useCreateInvite({ onCompleted })

    await createInvite()

    expect(onCompleted).not.toHaveBeenCalled()
  })
})
