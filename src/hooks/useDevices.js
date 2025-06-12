import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { selectDevices } from '../selectors/selectDevices'
import { selectVault } from '../selectors/selectVault'

/**
 * @param {{
 *  onCompleted?: (payload: any) => void
 *  shouldSkip?: boolean
 *  variables: {
 *    vaultId: string
 *    filters: {
 *        searchPattern: string
 *    }
 *    sort: {
 *      field: string
 *       direction: 'asc' | 'desc'
 *    }
 * }
 * }} options
 * @returns {{
 *    isLoading: boolean
 *    isInitialized: boolean
 *    deleteDevices: (deviceIds: Array<string>) => Promise<void>
 *    updateDevices: (devices: Array<Object>) => Promise<void>
 *    data: Object
 *   refetch: (vaultId: string) => Promise<void>
 * }}
 */
export const useDevices = ({ onCompleted, shouldSkip, variables } = {}) => {
  const dispatch = useDispatch()

  const { data: vaultData, isInitialized: isVaultInitialized } =
    useSelector(selectVault)

  const providedVaultId = variables?.vaultId || vaultData?.id

  const { isLoading, data } = useSelector(
    selectDevices({
      filters: {
        searchPattern: variables?.filters?.searchPattern
      },
      sort: variables?.sort
    })
  )

  const fetchVault = async (vaultId) => {
    const { payload, error } = await dispatch(getVaultById({ vaultId }))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const refetch = (vaultId) => {
    fetchVault(vaultId || providedVaultId)
  }

  // TODO do we need to updateDevice for OS info update?
  // const updateDevices = async (devices) => {
  //   const { error, payload } = await dispatch(updateDevicesAction(devices));

  //   if (!error) {
  //     onCompleted?.(payload);
  //   }
  // };

  // TODO we probably do need to have deleteDevice action
  // const deleteDevices = async (deviceIds) => {
  //   const { error, payload } = await dispatch(deleteDevicesAction(deviceIds));

  //   if (!error) {
  //     onCompleted?.(payload);
  //   }
  // };

  useEffect(() => {
    if (data || shouldSkip) {
      return
    }

    fetchVault(providedVaultId)
  }, [data, providedVaultId])

  return {
    isLoading,
    isInitialized: isVaultInitialized,
    data,
    refetch
  }
}
