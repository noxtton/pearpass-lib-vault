import { useDispatch, useSelector } from 'react-redux'
import { createInvite as createInviteAction } from '../actions/createInvite'
import { deleteInvite as deleteInviteAction } from '../actions/deleteInvite'
import { selectInvite } from '../selectors/selectInvite'

/**
 * @param {{
 *  onCompleted?: (payload: {vault: any}) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  data: any
 *  createInvite: () => void
 *  deleteInvite: () => void
 * }}
 */
export const useInvite = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()
  const { isLoading, data } = useSelector(selectInvite)

  const handleAction = async (action) => {
    const { error, payload } = await dispatch(action())
    if (!error) onCompleted?.(payload)
  }

  return {
    isLoading,
    data,
    createInvite: () => handleAction(createInviteAction),
    deleteInvite: () => handleAction(deleteInviteAction)
  }
}
