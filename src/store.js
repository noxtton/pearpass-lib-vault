import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import inviteReducer from './slices/inviteSlice.js'
import vaultReducer from './slices/vaultSlice.js'

export const store = configureStore({
  reducer: {
    vault: vaultReducer,
    invite: inviteReducer
  }
})

export const VaultProvider = (props) => {
  return Provider({ store: store, ...props })
}
