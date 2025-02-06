import { useDispatch } from 'react-redux'

import { getVaultById } from '../actions/getVaultById'
import { pair as pairAction } from '../actions/pair'
import { initListener } from '../instances/vault'

/**
 * @param {{
 *  onCompleted?: (vault: {id: string}) => void
 * }} options
 * @returns {{
 *  pair: (inviteCode: string) => Promise<void>
 *  }}
 */
export const usePair = ({ onCompleted } = {}) => {
  const dispatch = useDispatch()

  const pair = async (inviteCode) => {
    const { payload: vault } = await dispatch(pairAction(inviteCode))

    await initListener({
      vaultId: vault.id,
      onUpdate: () => {
        dispatch(getVaultById(vault.id))
      }
    })

    onCompleted?.(vault)
  }

  return { pair }
}
