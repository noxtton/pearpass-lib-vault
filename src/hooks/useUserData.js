import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { checkPasswordCreated } from '../actions/checkPasswordCreated'
import { createMasterPassword as createMasterPasswordApi } from '../api/createMasterPassword'
import { init } from '../api/init'
import { selectUser } from '../selectors/selectUser'
import { setLoading } from '../slices/userSlice'

/**
 * @param {{
 *  onCompleted?: (payload: {hasPasswordSet: boolean}) => void
 *  shouldSkip?: boolean
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  hasPasswordSet: boolean
 *  logIn: (password: string) => Promise<void>
 *  createMasterPassword: (password: string) => Promise<void>
 *  }}
 */
export const useUserData = ({ onCompleted, shouldSkip } = {}) => {
  const { isLoading, isInitialized, data: userData } = useSelector(selectUser)
  const dispatch = useDispatch()

  const logIn = async (password) => {
    setLoading(true)

    await init(password)

    setLoading(false)
  }

  const createMasterPassword = async (password) => {
    setLoading(true)

    await createMasterPasswordApi(password)

    setLoading(false)
  }

  useEffect(() => {
    if (isLoading || isInitialized || shouldSkip) {
      return
    }

    const checkPasswordState = async () => {
      const { payload: hasPasswordSet } = await dispatch(checkPasswordCreated())

      onCompleted?.({ hasPasswordSet })
    }

    checkPasswordState()
  }, [isLoading, isInitialized, shouldSkip])

  return {
    hasPasswordSet: userData.hasPasswordSet,
    isLoading,
    logIn,
    createMasterPassword
  }
}
