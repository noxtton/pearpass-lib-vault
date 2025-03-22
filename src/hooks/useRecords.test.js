import { renderHook, act } from '@testing-library/react'
import { useSelector, useDispatch } from 'react-redux'

import { useRecords } from './useRecords'
import { getVaultById } from '../actions/getVaultById'
import { selectRecords } from '../selectors/selectRecords'
import { selectVault } from '../selectors/selectVault'

jest.mock('react-redux')
jest.mock('../actions/getVaultById')
jest.mock('../selectors/selectRecords')
jest.mock('../selectors/selectVault')

describe('useRecords', () => {
  const mockDispatch = jest.fn()
  const mockOnCompleted = jest.fn()
  const mockVaultId = 'test-vault-id'
  const mockData = { records: [{ id: 1 }, { id: 2 }] }
  const mockPayload = { id: mockVaultId, records: mockData.records }

  beforeEach(() => {
    jest.clearAllMocks()
    useDispatch.mockReturnValue(mockDispatch)
    getVaultById.mockReturnValue({ type: 'GET_VAULT_BY_ID' })
    mockDispatch.mockResolvedValue({ payload: mockPayload, error: null })

    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { data: { id: mockVaultId } }
      }
      return { isLoading: false, data: mockData }
    })

    selectRecords.mockReturnValue(() => ({ isLoading: false, data: mockData }))
  })

  it('should return initial state', () => {
    useSelector.mockImplementation(() => ({ isLoading: true, data: null }))

    const { result } = renderHook(() =>
      useRecords({
        variables: { vaultId: mockVaultId }
      })
    )

    expect(result.current).toEqual({
      isLoading: true,
      data: null,
      refetch: expect.any(Function)
    })
  })

  it('should fetch vault data on initial render', () => {
    useSelector.mockImplementation(() => ({ isLoading: true, data: null }))

    renderHook(() =>
      useRecords({
        variables: { vaultId: mockVaultId }
      })
    )

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GET_VAULT_BY_ID' })
    expect(getVaultById).toHaveBeenCalledWith(mockVaultId)
  })

  it('should not fetch vault data if shouldSkip is true', () => {
    renderHook(() =>
      useRecords({
        shouldSkip: true,
        variables: { vaultId: mockVaultId }
      })
    )

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should not fetch vault data if data is already present', () => {
    renderHook(() =>
      useRecords({
        variables: { vaultId: mockVaultId }
      })
    )

    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('should call onCompleted callback after successful fetch', async () => {
    useSelector.mockImplementation(() => ({ isLoading: true, data: null }))

    renderHook(() =>
      useRecords({
        onCompleted: mockOnCompleted,
        variables: { vaultId: mockVaultId }
      })
    )

    await Promise.resolve()

    expect(mockOnCompleted).toHaveBeenCalledWith(mockPayload)
  })

  it('should refetch data when refetch is called', async () => {
    const { result } = renderHook(() =>
      useRecords({
        variables: { vaultId: mockVaultId }
      })
    )

    mockDispatch.mockClear()

    act(() => {
      result.current.refetch()
    })

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GET_VAULT_BY_ID' })
  })

  it('should apply filters and sort from variables', () => {
    const filters = {
      searchPattern: 'test',
      type: 'password',
      folder: 'personal',
      isFavorite: true
    }

    const sort = {
      field: 'name',
      direction: 'asc'
    }

    renderHook(() =>
      useRecords({
        variables: {
          vaultId: mockVaultId,
          filters,
          sort
        }
      })
    )

    expect(selectRecords).toHaveBeenCalledWith({
      filters,
      sort
    })
  })
})
