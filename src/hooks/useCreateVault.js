import { useDispatch, useSelector } from 'react-redux'

import { createVault as createVaultAction } from '../actions/createVault'
import { selectVault } from '../selectors/selectVault'

/**
 * @param {{
 *  onCompleted?: (payload: {vault: any}) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  createVault: () => void
 *  }}
 */
export const useCreateVault = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()

  const { isLoading } = useSelector(selectVault)

  const createVault = async () => {
    const { error, payload } = await dispatch(createVaultAction())

    if (!error) {
      onCompleted?.(payload)
    }
  }

  return { isLoading, createVault }
}
