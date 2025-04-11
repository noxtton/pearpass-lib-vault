import { useState } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { createVault as createVaultAction } from '../actions/createVault'
import { selectVault } from '../selectors/selectVault'

/**
 * @param {{
 *  onCompleted?: (payload: {vault: any}) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  createVault: ({name: string, password?: string}) => Promise<void>
 *  }}
 */
export const useCreateVault = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()

  const [isCreateLoading, setIsCreateLoading] = useState(false)

  const { isLoading: isVaultLoading } = useSelector(selectVault)

  const createVault = async ({ name, password }) => {
    setIsCreateLoading(true)

    const { error, payload } = await dispatch(
      createVaultAction({ name, password })
    )

    setIsCreateLoading(false)

    if (!error) {
      onCompleted?.(payload)
    }
  }

  return { isLoading: isCreateLoading || isVaultLoading, createVault }
}
