import { useDispatch, useSelector } from 'react-redux'

import { deleteFolder as deleteFolderAction } from '../actions/deleteFolder'
import { renameFolder as renameFolderAction } from '../actions/renameFolder'
import { selectFolders } from '../selectors/selectFolders'

/**
 * @param {{
 *  variables?: {
 *    searchPattern?: string
 *  }
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  data: any[]
 *  renameFolder: (name : string, newName: string) => Promise<void>
 *  deleteFolder: (name: string) => Promise<void>
 *  }}
 */
export const useFolders = ({ variables } = {}) => {
  const dispatch = useDispatch()

  const { isLoading, data } = useSelector(
    selectFolders({
      searchPattern: variables?.searchPattern
    })
  )

  const renameFolder = async (name, newName) => {
    const selectedFolder = data.customFolders[name]

    await dispatch(renameFolderAction({ selectedFolder, newName }))
  }

  const deleteFolder = async (name) => {
    const selectedFolder = data.customFolders[name]

    await dispatch(deleteFolderAction(selectedFolder))
  }

  return { isLoading, data, renameFolder, deleteFolder }
}
