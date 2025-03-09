import { useEffect, useState } from 'react'

import { getEncryption } from '../api/getEncryption'

/**
 * @param {{
 *  onCompleted?: (payload: {hasPasswordSet: boolean}) => void
 * }} options
 * @returns {{
 *  isLoading: boolean
 *  hasPasswordSet: boolean
 * logIn: (password: string) => Promise<void>
 *  }}
 */
export const useUserData = ({ onCompleted } = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [hasPasswordSet, setHasPasswordSet] = useState(false)

  const logIn = async (password) => {
    setIsLoading(true)

    const encryptionData = await getEncryption()

    if (!encryptionData || password !== encryptionData.TESTpassword) {
      throw new Error('Invalid password')
    }

    setIsLoading(false)
  }

  useEffect(() => {
    const checkPasswordState = async () => {
      try {
        setIsLoading(true)

        const encryptionData = await getEncryption()

        const hasPasswordSet = !!encryptionData?.TESTpassword

        setHasPasswordSet(hasPasswordSet)

        setIsLoading(false)

        onCompleted?.({ hasPasswordSet })
      } catch (error) {
        setIsLoading(false)
        console.error(error)
      }
    }

    checkPasswordState()
  }, [])

  return { isLoading, hasPasswordSet, logIn }
}
