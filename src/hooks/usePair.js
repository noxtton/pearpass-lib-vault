import { useState } from 'react'

import { useDispatch } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { pair as pairAction } from '../actions/pair'
import { initListener } from '../api/initListener'

/**
 * @param {{
 *  onCompleted?: (vault: {id: string}) => void
 *  onError?: (error: Error) => void
 * }} options
 * @returns {{
 *  pair: (inviteCode: string) => Promise<void>
 *  isLoading: boolean
 *  }}
 */
export const usePair = ({ onCompleted, onError } = {}) => {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false)

  const pair = async (inviteCode) => {
    try {
      setIsLoading(true)

      const pairPromise = dispatch(pairAction(inviteCode))

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Pairing timeout after 5 seconds')),
          10000
        )
      })

      const { payload: vault } = await Promise.race([
        pairPromise,
        timeoutPromise
      ])

      await initListener({
        vaultId: vault.id,
        onUpdate: () => {
          dispatch(getVaultById({ vaultId: vault.id }))
        }
      })

      onCompleted?.(vault)

      setIsLoading(false)
    } catch (error) {
      onError?.(error)

      setIsLoading(false)
    }
  }

  return { pair, isLoading }
}
