import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { initializeVaults } from '../actions/initializeVaults'
import { selectVaults } from '../selectors/selectVaults'

/**
 *  @param {{
 *    onCompleted?: (payload: any) => void
 *    shouldSkip?: boolean
 *  }} options
 *   @returns {{
 *      isLoading: boolean
 *      data: any
 *    refetch: (vaultId: string) => void
 *  }}
 */
export const useVaults = ({ onCompleted, shouldSkip } = {}) => {
  const dispatch = useDispatch()

  const { isLoading, data, isInitialized, isInitializing } =
    useSelector(selectVaults)

  const fetchVaults = async () => {
    const { payload: vaults } = await dispatch(initializeVaults())

    onCompleted?.(vaults)
  }

  const refetch = async () => {
    await fetchVaults()
  }

  useEffect(() => {
    if (shouldSkip || isLoading || isInitialized || isInitializing) {
      return
    }

    fetchVaults()
  }, [shouldSkip, isLoading, isInitialized, isInitializing])

  return { isLoading, data, refetch }
}
