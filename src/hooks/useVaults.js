import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { getVaults } from '../actions/getVaults'
import { initializeVaults } from '../actions/initializeVaults'
import { selectVaults } from '../selectors/selectVaults'

/**
 *  @param {{
 *    onCompleted?: (payload: any) => void
 *   onInitialize?: (payload: any) => void
 *    shouldSkip?: boolean
 *  }} options
 *   @returns {{
 *      isLoading: boolean
 *      data: any
 *    refetch: () => Promise<void>
 *    initVaults: (password: string) => Promise<void>
 *  }}
 */
export const useVaults = ({ onCompleted, onInitialize, shouldSkip } = {}) => {
  const dispatch = useDispatch()

  const { isLoading, data, isInitialized, isInitializing } =
    useSelector(selectVaults)

  const initVaults = async (password) => {
    const { payload: vaults } = await dispatch(initializeVaults(password))

    onInitialize?.(vaults)
  }

  const fetchVaults = async () => {
    const { payload: vaults } = await dispatch(getVaults())

    onCompleted?.(vaults)
  }

  const refetch = async () => {
    await fetchVaults()
  }

  useEffect(() => {
    if (shouldSkip || isLoading || isInitializing || isInitialized) {
      return
    }

    initVaults()
  }, [shouldSkip, isLoading, isInitialized, isInitializing])

  return { isLoading, data, refetch, initVaults }
}
