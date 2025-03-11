import { createSelector } from '@reduxjs/toolkit'

import { RECORD_TYPES } from '../constants/recordTypes'

export const selectRecordCountsByType = ({ filters } = {}) =>
  createSelector(
    (state) => state.vault,
    (vault) => {
      const records =
        vault.data?.records.filter((record) => {
          if (
            (filters?.folder || filters?.folder === null) &&
            record.folder !== filters?.folder
          ) {
            return false
          }

          return record.type !== undefined
        }) ?? []

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
        isLoading: vault.isLoading,
        data
      }
    }
  )
