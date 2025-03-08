import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { initializeVaults } from '../actions/initializeVaults'
import { initListener } from '../api/initListener'
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
    const { payload: vault } = await dispatch(getVaultById(vaultId))

    await initListener({
      vaultId: vaultId,
      onUpdate: () => {
        dispatch(getVaultById(vaultId))
      }
    })

    onCompleted?.(vault)
  }

  const initVaults = async (vaultId) => {
    await dispatch(initializeVaults())

    await fetchVault(vaultId)
  }

  const refetch = (vaultId) => {
    if (!vaultId && !variables?.vaultId) {
      console.error('refetch: Vault ID is required')
      return
    }

    fetchVault(vaultId || variables.vaultId)
  }

  useEffect(() => {
    if (isInitializing || isInitialized || shouldSkip || !variables?.vaultId) {
      return
    }

    initVaults(variables.vaultId)
  }, [isInitializing, isInitialized, variables?.vaultId, shouldSkip])

  useEffect(() => {
    if (
      data ||
      shouldSkip ||
      !variables?.vaultId ||
      !isInitialized ||
      isLoading ||
      isInitializing
    ) {
      return
    }

    fetchVault(variables?.vaultId)
  }, [data, variables?.vaultId, isInitialized])

  return { isLoading, data, isInitialized, refetch }
}
