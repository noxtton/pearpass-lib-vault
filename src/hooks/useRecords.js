import { useEffect } from 'react'

import { useSelector, useDispatch } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { selectRecords } from '../selectors/selectRecords'
import { selectVault } from '../selectors/selectVault'

/**
 * @param {{
 *  onCompleted?: (payload: any) => void
 *  shouldSkip?: boolean
 *  variables: {
 *    vaultId: string
 *    filters: {
 *        searchPattern: string
 *        type: string
 *        folder: string
 *        isFavorite: boolean
 *    }
 *    sort: {
 *      field: string
 *       direction: 'asc' | 'desc'
 *    }
 * }
 * }} options
 * @returns {{
 *    isLoading: boolean
 *    data: any
 *   refetch: (vaultId: string) => void
 * }}
 */
export const useRecords = ({ onCompleted, shouldSkip, variables } = {}) => {
  const dispatch = useDispatch()

  const { data: vaultData } = useSelector(selectVault)

  const providedVaultId = variables?.vaultId || vaultData?.id

  const { isLoading, data } = useSelector(
    selectRecords({
      filters: {
        searchPattern: variables?.filters?.searchPattern,
        type: variables?.filters?.type,
        folder: variables?.filters?.folder,
        isFavorite: variables?.filters?.isFavorite
      },
      sort: variables?.sort
    })
  )

  const fetchVault = async (vaultId) => {
    const { payload, error } = await dispatch(getVaultById(vaultId))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const refetch = (vaultId) => {
    fetchVault(vaultId || providedVaultId)
  }

  useEffect(() => {
    if (data || shouldSkip) {
      return
    }

    fetchVault(providedVaultId)
  }, [data, providedVaultId])

  return { isLoading, data, refetch }
}
