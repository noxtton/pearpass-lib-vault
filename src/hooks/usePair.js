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
 *  }}
 */
export const usePair = ({ onCompleted, onError } = {}) => {
  const dispatch = useDispatch()

  const pair = async (inviteCode) => {
    try {
      const pairPromise = dispatch(pairAction(inviteCode))

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Pairing timeout after 5 seconds')),
          5000
        )
      })

      const { payload: vault } = await Promise.race([
        pairPromise,
        timeoutPromise
      ])

      await initListener({
        vaultId: vault.id,
        onUpdate: () => {
          dispatch(getVaultById(vault.id))
        }
      })

      onCompleted?.(vault)
    } catch (error) {
      onError?.(error)
    }
  }

  return { pair }
}
