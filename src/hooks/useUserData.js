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
