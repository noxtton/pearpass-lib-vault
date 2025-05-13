import { useDispatch, useSelector } from 'react-redux'

import { initializeUser } from '../actions/initializeUser'
import { createMasterPassword as createMasterPasswordApi } from '../api/createMasterPassword'
import { init } from '../api/init'
import { updateMasterPassword as updateMasterPasswordApi } from '../api/updateMasterPassword'
import { selectUser } from '../selectors/selectUser'
import { setLoading } from '../slices/userSlice'

/**
 * @returns {{
 *  isLoading: boolean
 *  isInitialized: boolean
 *  refetch: () => Promise<{
 *    hasPasswordSet: boolean
 *    isLoggedIn: boolean
 *    isVaultOpen: boolean
 *  }>
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
 *  updateMasterPassword: ({
 *    newPassword: string
 *    currentPassword: string
 *  }) => Promise<{
 *    ciphertext: string
 *    nonce: string
 *    salt: string
 *    hashedPassword: string
 *  }>
 *  refetch: () => Promise<{
 *    hasPasswordSet: boolean
 *    isLoggedIn: boolean
 *    isVaultOpen: boolean
 *  }>
 *  }}
 */
export const useUserData = () => {
  const { isLoading, isInitialized, data: userData } = useSelector(selectUser)
  const dispatch = useDispatch()

  const logIn = async ({
    ciphertext,
    nonce,
    salt,
    hashedPassword,
    password
  }) => {
    dispatch(setLoading(true))

    await init({
      ciphertext,
      nonce,
      salt,
      hashedPassword,
      password
    })

    dispatch(setLoading(false))
  }

  const createMasterPassword = async (password) => {
    dispatch(setLoading(true))

    const result = await createMasterPasswordApi(password)

    dispatch(setLoading(false))

    return result
  }

  const updateMasterPassword = async ({ newPassword, currentPassword }) => {
    dispatch(setLoading(true))

    const result = await updateMasterPasswordApi({
      newPassword,
      currentPassword
    })

    dispatch(setLoading(false))

    return result
  }

  const refetch = async () => {
    const { payload } = await dispatch(initializeUser())

    return payload
  }

  return {
    data: userData,
    isInitialized: isInitialized,
    hasPasswordSet: userData.hasPasswordSet,
    isLoading,
    logIn,
    createMasterPassword,
    updateMasterPassword,
    refetch
  }
}
