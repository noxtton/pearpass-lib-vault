import { useState } from 'react'

import { useDispatch } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { pair as pairAction } from '../actions/pair'
import { initListener } from '../api/initListener'

/**
 * @returns {{
 *  pair: (inviteCode: string) => Promise<string>
 *  isLoading: boolean
 *  }}
 */
export const usePair = () => {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false)

  const pairPromise = async (inviteCode) => {
    const { error, payload: vaultId } = await dispatch(pairAction(inviteCode))

    if (error) {
      throw new Error(`Pairing failed: ${error.message}`)
    }

    return vaultId
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      setIsLoading(false)
      return reject(new Error('Pairing timeout after 10 seconds'))
    }, 10000)
  })

  const pair = async (inviteCode) => {
    setIsLoading(true)

    const vaultId = await Promise.race([
      pairPromise(inviteCode),
      timeoutPromise
    ])

    await initListener({
      vaultId,
      onUpdate: () => {
        dispatch(getVaultById({ vaultId }))
      }
    })

    setIsLoading(false)

    return vaultId
  }

  return { pair, isLoading }
}
