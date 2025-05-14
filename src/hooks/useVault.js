import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { resetState as resetStateAction } from '../actions/resetState'
import { updateVault as updateVaultAction } from '../actions/updateVault'
import { checkVaultIsProtected } from '../api/checkVaultIsProtected'
import { getCurrentVault } from '../api/getCurrentVault'
import { initListener } from '../api/initListener'
import { selectVault } from '../selectors/selectVault'
import { selectVaults } from '../selectors/selectVaults'
import { logger } from '../utils/logger'

/**
 *  @param {{
 *      onCompleted?: (payload: any) => void
 *      shouldSkip?: boolean
 *      variables: {
 *        vaultId: string
 *      }
 *  }} options
 *   @returns {{
 *      isLoading: boolean
 *      isInitialized: boolean
 *      data: any
 *      refetch: (vaultId: string, password?: string) => Promise<any>
 *      isVaultProtected: (vaultId: string) => Promise<boolean>
 *      resetState: () => void
 *  }}
 */
export const useVault = ({ onCompleted, shouldSkip, variables } = {}) => {
  const dispatch = useDispatch()

  const {
    isLoading: isVaultsLoading,
    isInitialized: isVaultsInitialized,
    isInitializing
  } = useSelector(selectVaults)

  const {
    isLoading: isVaultLoading,
    data,
    isInitialized: isVaultInitialized
  } = useSelector(selectVault)

  const isLoading = isVaultsLoading || isVaultLoading

  const isVaultProtected = async (vaultId) => {
    return checkVaultIsProtected(vaultId)
  }

  const fetchVault = async (vaultId, password) => {
    const { payload: vault, error } = await dispatch(
      getVaultById({ vaultId: vaultId, password: password })
    )

    if (error) {
      throw new Error('Error fetching vault')
    }

    await initListener({
      vaultId: vaultId,
      onUpdate: () => {
        dispatch(getVaultById({ vaultId }))
      }
    })

    onCompleted?.(vault)

    return vault
  }

  const updateVault = async (vaultId, vaultUpdate) => {
    const { payload: vault, error } = await dispatch(
      getVaultById({ vaultId, password: vaultUpdate.currentPassword })
    )

    if (error) {
      throw new Error('Error fetching vault')
    }

    const { error: createError } = await dispatch(
      updateVaultAction({
        vault: { ...vault, name: vaultUpdate.name },
        newPassword: vaultUpdate.password,
        currentPassword: vaultUpdate.currentPassword
      })
    )

    if (createError) {
      throw new Error('Error updating vault')
    }
  }

  const refetch = async (vaultId, password) => {
    const correntVault = await getCurrentVault()

    const id = vaultId || variables?.vaultId || correntVault?.id

    if (!id) {
      logger.error('refetch: Vault ID is required')
      return
    }

    const vault = await fetchVault(id, password)

    return vault
  }

  const resetState = () => {
    dispatch(resetStateAction())
  }

  useEffect(() => {
    if (
      data ||
      shouldSkip ||
      !variables?.vaultId ||
      !isVaultsInitialized ||
      isLoading ||
      isInitializing
    ) {
      return
    }

    fetchVault(variables?.vaultId)
  }, [data, variables?.vaultId, isVaultsInitialized])

  return {
    isLoading,
    data,
    isInitialized: isVaultInitialized,
    refetch,
    isVaultProtected,
    resetState,
    updateVault
  }
}
