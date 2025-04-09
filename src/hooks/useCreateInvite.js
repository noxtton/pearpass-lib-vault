import { useDispatch, useSelector } from 'react-redux'

import { createInvite as createInviteAction } from '../actions/createInvite'
import { selectInvite } from '../selectors/selectInvite'

/**
 * @param {{
 *  onCompleted?: (payload: {vault: any}) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  data: any
 *  createInvite: () => void
 *  }}
 */
export const useCreateInvite = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()

  const { isLoading, data } = useSelector(selectInvite)

  const createInvite = async () => {
    const { error, payload } = await dispatch(createInviteAction())

    if (!error) {
      onCompleted?.(payload)
    }
  }

  return { isLoading, createInvite, data }
}
