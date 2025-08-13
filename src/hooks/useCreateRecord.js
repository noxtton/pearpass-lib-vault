import { useDispatch, useSelector } from 'react-redux'

import { createRecord as createRecordAction } from '../actions/createRecord'
import { selectVault } from '../selectors/selectVault'

/**
 * @param {{
 *  onCompleted?: (payload: {record: any}) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  createRecord: (record: any) => Promise<void>
 * }}
 */
export const useCreateRecord = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()

  const { isRecordLoading: isLoading } = useSelector(selectVault)

  const createRecord = async (record) => {
    const { error, payload } = await dispatch(createRecordAction(record))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  return { isLoading, createRecord }
}
