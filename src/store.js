import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import vaultReducer from './slice'

export const store = configureStore({
  reducer: {
    vault: vaultReducer
  }
})

export const VaultProvider = (props) => {
  return Provider({ store: store, ...props })
}
