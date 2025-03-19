import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { resetState as resetStateAction } from '../actions/resetState'
import { getVaultEncryption } from '../api/getVaultEncryption'
import { initListener } from '../api/initListener'
import { selectVault } from '../selectors/selectVault'
import { selectVaults } from '../selectors/selectVaults'

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
 *    refetch: (vaultId: string) => Promise<void>
 *    isVaultProtected: (vaultId: string) => Promise<boolean>
 *   resetState: () => void
 *  }}
 */
export const useVault = ({ onCompleted, shouldSkip, variables } = {}) => {
  const dispatch = useDispatch()

  const {
    isLoading: isVaultsLoading,
    isInitialized,
    isInitializing
  } = useSelector(selectVaults)

  const { isLoading: isVaultLoading, data } = useSelector(selectVault)

  const isLoading = isVaultsLoading || isVaultLoading

  const isVaultProtected = async (vaultId) => {
    const encryptionData = await getVaultEncryption(vaultId)

    return !!encryptionData?.TESTpassword
  }

  const fetchVault = async (vaultId, password) => {
    const { payload: vault } = await dispatch(getVaultById(vaultId, password))

    await initListener({
      vaultId: vaultId,
      onUpdate: () => {
        dispatch(getVaultById(vaultId))
      }
    })

    onCompleted?.(vault)
  }

  const refetch = (vaultId, password) => {
    if (!vaultId && !variables?.vaultId) {
      console.error('refetch: Vault ID is required')
      return
    }

    fetchVault(vaultId || variables.vaultId, password)
  }

  const resetState = () => {
    dispatch(resetStateAction())
  }

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

  return {
    isLoading,
    data,
    isInitialized,
    refetch,
    isVaultProtected,
    resetState
  }
}
