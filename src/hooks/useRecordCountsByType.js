import { useSelector } from 'react-redux'

import { selectRecordCountsByType } from '../selectors/selectRecordCountsByType'

/**
 * @returns {{
 *  isLoading: boolean
 *  data: any
 * }}
 */
export const useRecordCountsByType = () => {
  const { isLoading, data } = useSelector(selectRecordCountsByType)

  return { isLoading, data }
}
