import { useDispatch, useSelector } from 'react-redux'

import { createFolder as createFolderAction } from '../actions/createFolder'
import { selectVault } from '../selectors/selectVault'

/**
 * @param {{
 *  onCompleted?: (payload: {name: string}) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  createFolder: (folderName: string) => void
 * }}
 */
export const useCreateFolder = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()

  const { isFolderLoading: isLoading } = useSelector(selectVault)

  const createFolder = async (folderName) => {
    const { error, payload } = await dispatch(createFolderAction(folderName))

    if (!error) {
      onCompleted?.(payload)
    }
  }

  return { isLoading, createFolder }
}
