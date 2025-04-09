import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import inviteReducer from './slices/inviteSlice'
import userReducer from './slices/userSlice'
import vaultReducer from './slices/vaultSlice'
import vaultsReducer from './slices/vaultsSlice'

export const store = configureStore({
  reducer: {
    user: userReducer,
    vaults: vaultsReducer,
    vault: vaultReducer,
    invite: inviteReducer
  }
})

export const VaultProvider = (props) => {
  return Provider({ store: store, ...props })
}
