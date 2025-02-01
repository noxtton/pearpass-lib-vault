import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { initializeVaults } from '../actions/initializeVaults'
import { selectVault } from '../selectors/selectVault'

/**
 *  @param {{
 *    onCompleted?: (payload: any) => void
 *    shouldSkip?: boolean
 *    variables: {
 *      vaultId: string
 *    }
 *  }} options
 *   @returns {{
 *      isLoading: boolean
 *      isInitialized: boolean
 *      data: any
 *    refetch: (vaultId: string) => void
 *  }}
 */
export const useVault = ({ onCompleted, shouldSkip, variables } = {}) => {
  const dispatch = useDispatch()

  const { isLoading, data, isInitialized, isInitializing } =
    useSelector(selectVault)

  const fetchVault = async (vaultId) => {
    if (!isInitialized) {
      return
    }

    const { payload, error } = await dispatch(getVaultById(vaultId))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const initVaults = async (vaultId) => {
    await dispatch(initializeVaults())

    await fetchVault(vaultId)
  }

  const refetch = (vaultId) => {
    fetchVault(vaultId || variables?.vaultId)
  }

  useEffect(() => {
    if (isInitializing || isInitialized) {
      return
    }
    initVaults(variables?.vaultId)
  }, [isInitializing, isInitialized, variables?.vaultId])

  useEffect(() => {
    if (data || shouldSkip) {
      return
    }

    fetchVault(variables?.vaultId)
  }, [data, variables?.vaultId, isInitialized])

  return { isLoading, data, isInitialized, refetch }
}
