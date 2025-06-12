import { useDispatch, useSelector } from 'react-redux'

import { addDevice as addDeviceAction } from '../actions/addDevice'
import { selectVault } from '../selectors/selectVault'

/**
 * @param {{
 *  onCompleted?: (payload: {device: any}) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  addDevice: (device: any) => void
 * }}
 */
export const useAddDevice = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()

  const { isDeviceLoading: isLoading } = useSelector(selectVault)

  const addDevice = async (device) => {
    const { error, payload } = await dispatch(addDeviceAction(device))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  return { isLoading, addDevice }
}
