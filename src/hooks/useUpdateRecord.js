import { useDispatch, useSelector } from 'react-redux'

import {
  updateRecord as updateRecordAction,
  updateFolder as updateFolderAction,
  updatePinnedState as updatePinnedStateAction,
  updateFavoriteState as updateFavoriteStateAction
} from '../actions/updateRecord'
import { selectVault } from '../selectors/selectVault'

/**
 * @param {{
 *    onCompleted?: (payload: any) => void
 *  }} options
 * @returns {{
 *    isLoading: boolean
 *    updateRecord: (record: any) => void
 *    updateFolder: (recordId: string, folder: string) => void
 *    updatePinnedState: (recordId: string, isPinned: boolean) => void
 *   updateFavoriteState: (recordId: string, isFavorite: boolean) => void
 * }}
 */
export const useUpdateRecord = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()

  const { isRecordLoading: isLoading } = useSelector(selectVault)

  const updateRecord = async (record) => {
    const { error, payload } = await dispatch(updateRecordAction(record))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const updateFolder = async (recordId, folder) => {
    const { error, payload } = await dispatch(
      updateFolderAction(recordId, folder)
    )

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const updatePinnedState = async (recordId, isPinned) => {
    const { error, payload } = await dispatch(
      updatePinnedStateAction(recordId, isPinned)
    )

    if (!error) {
      onCompleted?.(payload)
    }
  }

  const updateFavoriteState = async (recordId, isFavorite) => {
    const { error, payload } = await dispatch(
      updateFavoriteStateAction(recordId, isFavorite)
    )

    if (!error) {
      onCompleted?.(payload)
    }
  }

  return {
    isLoading,
    updateRecord,
    updateFolder,
    updatePinnedState,
    updateFavoriteState
  }
}
