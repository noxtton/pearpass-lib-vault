import { useEffect } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { initializeUser } from '../actions/initializeUser'
import { createMasterPassword as createMasterPasswordApi } from '../api/createMasterPassword'
import { init } from '../api/init'
import { updateMasterPassword as updateMasterPasswordApi } from '../api/updateMasterPassword'
import { selectUser } from '../selectors/selectUser'
import { setLoading } from '../slices/userSlice'

/**
 * @param {{
 *  onCompleted?: (payload: {hasPasswordSet: boolean}) => void
 *  shouldSkip?: boolean
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  isInitialized: boolean
 *  data: {
 *    hasPasswordSet: boolean
 *    isLoggedIn: boolean
 *    isVaultOpen: boolean
 *  }
 *  hasPasswordSet: boolean
 *  logIn: ({
 *    ciphertext?: string
 *    nonce?: string
 *    salt?: string
 *    hashedPassword?: string
 *    password?: string
 *  }) => Promise<void>
 *  createMasterPassword: (password: string) => Promise<{
 *   ciphertext: string
 *   nonce: string
 *   salt: string
 *   hashedPassword: string
 *    }>
 *  }}
 */
export const useUserData = ({ onCompleted, shouldSkip } = {}) => {
  const { isLoading, isInitialized, data: userData } = useSelector(selectUser)
  const dispatch = useDispatch()

  const logIn = async ({
    ciphertext,
    nonce,
    salt,
    hashedPassword,
    password
  }) => {
    setLoading(true)

    await init({
      ciphertext,
      nonce,
      salt,
      hashedPassword,
      password
    })

    setLoading(false)
  }

  const createMasterPassword = async (password) => {
    setLoading(true)

    const result = await createMasterPasswordApi(password)

    setLoading(false)

    return result
  }

  const updateMasterPassword = async ({ newPassword, currentPassword }) => {
    setLoading(true)

    const result = await updateMasterPasswordApi({
      newPassword,
      currentPassword
    })

    setLoading(false)

    return result
  }

  useEffect(() => {
    if (isLoading || isInitialized || shouldSkip) {
      return
    }

    const init = async () => {
      const { payload } = await dispatch(initializeUser())

      onCompleted?.(payload)
    }

    init()
  }, [isLoading, isInitialized, shouldSkip])

  return {
    data: userData,
    isInitialized: isInitialized,
    hasPasswordSet: userData.hasPasswordSet,
    isLoading,
    logIn,
    createMasterPassword,
    updateMasterPassword
  }
}
