import { useSelector } from 'react-redux'

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
 *  }}
 */
export const useFolders = ({ variables } = {}) => {
  const { isLoading, data } = useSelector(
    selectFolders({
      searchPattern: variables?.searchPattern
    })
  )

  return { isLoading, data }
}
