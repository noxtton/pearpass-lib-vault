import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { initializeVaults } from '../actions/initializeVaults'
import { initListener } from '../instances/vault'
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

    // TODO: Implement this
    // await initListener({
    //   vaultId,
    //   onUpdate: () => {
    //     dispatch(getVaultById(vaultId))
    //   }
    // })

    onCompleted?.(vault)
  }

  const initVaults = async (vaultId) => {
    const { payload: vaults } = await dispatch(initializeVaults())

    const selectedVaultId = vaultId ?? vaults?.[0]?.id

    if (!selectedVaultId) {
      onCompleted?.()

      return
    }

    await fetchVault(selectedVaultId)
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
