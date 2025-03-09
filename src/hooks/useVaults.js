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

  const fetchVaults = async (password) => {
    const { payload: vaults } = await dispatch(initializeVaults(password))

    onCompleted?.(vaults)
  }

  const refetch = async (password) => {
    await fetchVaults(password)
  }

  useEffect(() => {
    if (shouldSkip || isLoading || isInitializing || isInitialized) {
      return
    }

    fetchVaults()
  }, [shouldSkip, isLoading, isInitialized, isInitializing])

  return { isLoading, data, refetch }
}
