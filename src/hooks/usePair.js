import { useState } from 'react'

import { useDispatch } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { cancelPairActiveVault as cancelPairActiveVaultApi } from '../api/cancelPairActiveVault'
import { initListener } from '../api/initListener'
import { pairActiveVault as pairActiveVaultApi } from '../api/pairActiveVault'

/**
 * @returns {{
 *  pairActiveVault: (inviteCode: string) => Promise<string>
 *  cancelPairActiveVault: () => Promise<void>,
 *  isLoading: boolean
 *  }}
 */
export const usePair = () => {
  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false)

  const pairActiveVaultPromise = async (inviteCode) => {
    const { error, payload: vaultId } = await dispatch(
      pairActiveVaultApi(inviteCode)
    )

    if (error) {
      throw new Error(`Pairing failed: ${error.message}`)
    }

    return vaultId
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(async () => {
      await cancelPairActiveVaultApi()
      setIsLoading(false)
      return reject(new Error('Pairing timeout after 10 seconds'))
    }, 10000)
  })

  const pairActiveVault = async (inviteCode) => {
    setIsLoading(true)

    const vaultId = await Promise.race([
      pairActiveVaultPromise(inviteCode),
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

  const cancelPairActiveVault = async () => {
    setIsLoading(false)
    await cancelPairActiveVaultApi()
  }

  return { pairActiveVault, cancelPairActiveVault, isLoading }
}
