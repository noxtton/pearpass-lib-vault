import { createAsyncThunk } from '@reduxjs/toolkit'

export const deleteRecord = createAsyncThunk(
  'vault/deleteRecord',
  async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(id)
      }, 500)
    })
  }
)
