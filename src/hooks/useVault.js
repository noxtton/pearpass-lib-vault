import { useDispatch, useSelector } from 'react-redux'

import { addDevice as addDeviceAction } from '../actions/addDevice.js'
import { getVaultById } from '../actions/getVaultById'
import { getVaults } from '../actions/getVaults'
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
 *      shouldSkip?: boolean
 *      variables: {
 *        vaultId: string
 *      }
 *  }} options
 *   @returns {{
 *      isLoading: boolean
 *      isInitialized: boolean
 *      data: any
 *      refetch: (
 *        vaultId: string,
 *        params?: {
 *         password?: string
 *         ciphertext?: string
 *         nonce?: string
 *         hashedPassword?: string
 *        }) => Promise<any>
 *      isVaultProtected: (vaultId: string) => Promise<boolean>
 *      resetState: () => void
 *  }}
 */
export const useVault = ({ variables } = {}) => {
  const dispatch = useDispatch()

  const { isLoading: isVaultsLoading } = useSelector(selectVaults)

  const {
    isLoading: isVaultLoading,
    data,
    isInitialized: isVaultInitialized
  } = useSelector(selectVault)

  const isLoading = isVaultsLoading || isVaultLoading

  const isVaultProtected = async (vaultId) => checkVaultIsProtected(vaultId)

  const fetchVault = async (vaultId, params) => {
    const { payload: vault, error } = await dispatch(
      getVaultById({ vaultId: vaultId, params })
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

    return vault
  }

  const refetch = async (vaultId, params) => {
    const correntVault = await getCurrentVault()

    const id = vaultId || variables?.vaultId || correntVault?.id

    if (!id) {
      logger.error('refetch: Vault ID is required')
      return
    }

    const vault = await fetchVault(id, params)

    return vault
  }

  const addDevice = async (device) => {
    const hasDeviceAdded = data?.devices?.some((d) => d.name === device)

    if (hasDeviceAdded) {
      logger.log('Device already added to vault')
      return
    }

    const { error: createError } = await dispatch(addDeviceAction(device))

    await refetch()

    await dispatch(getVaults())

    if (createError) {
      throw new Error('Error adding device to device list in vault')
    }
  }

  const updateVault = async (vaultId, vaultUpdate) => {
    const { error: createError } = await dispatch(
      updateVaultAction({
        vaultId: vaultId,
        name: vaultUpdate.name,
        newPassword: vaultUpdate.password,
        currentPassword: vaultUpdate.currentPassword
      })
    )

    await refetch()

    await dispatch(getVaults())

    if (createError) {
      throw new Error('Error updating vault')
    }
  }

  const resetState = () => {
    dispatch(resetStateAction())
  }

  return {
    isLoading,
    data,
    isInitialized: isVaultInitialized,
    refetch,
    addDevice,
    isVaultProtected,
    resetState,
    updateVault
  }
}
