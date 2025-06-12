import { useState } from 'react'

import { useDispatch } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { pair as pairAction } from '../actions/pair'
import { initListener } from '../api/initListener'

/**
 * @returns {{
 *  pair: (inviteCode: string) => Promise<{
 *    vaultId: string
 *  }>
 *  isLoading: boolean
 *  }}
 */
export const usePair = () => {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false)

  const pair = async (inviteCode) => {
    setIsLoading(true)

    const pairPromise = dispatch(pairAction(inviteCode))

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error('Pairing timeout after 10 seconds')),
        10000
      )
    })

    const { payload: vaultId } = await Promise.race([
      pairPromise,
      timeoutPromise
    ])

    await initListener({
      vaultId: vaultId,
      onUpdate: () => {
        dispatch(getVaultById({ vaultId: vaultId }))
      }
    })

    setIsLoading(false)
    return vaultId
  }

  return { pair, isLoading }
}
