import { RECORD_TYPES } from '../constants/recordTypes'

export const selectRecordCountsByType = (state) => {
  const records = state.vault.data?.records ?? []

  const data = records.reduce(
    (acc, record) => {
      const type = record.type

      if (!acc[type]) {
        acc[type] = 0
      }

      acc[type]++

      return acc
    },
    {
      all: records.length,
      [RECORD_TYPES.NOTE]: 0,
      [RECORD_TYPES.CREDIT_CARD]: 0,
      [RECORD_TYPES.CUSTOM]: 0,
      [RECORD_TYPES.IDENTITY]: 0,
      [RECORD_TYPES.LOGIN]: 0
    }
  )

  return {
    isLoading: state.vault.isLoading,
    data: data
  }
}
