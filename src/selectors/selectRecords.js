import { matchPatternToValue } from '../utils/matchPatternToValue'

export const selectRecords =
  ({ filters, sort } = {}) =>
  (state) => {
    const records =
      state.vault.data?.records?.filter((record) => {
        if (
          (filters?.folder || filters?.folder === null) &&
          record.folder !== filters?.folder
        ) {
          return false
        }

        if (
          !!filters?.searchPattern?.length &&
          !matchPatternToValue(filters.searchPattern, record.data.title) &&
          !matchPatternToValue(filters.searchPattern, record.folder)
        ) {
          return false
        }

        if (filters?.type && record.type !== filters.type) {
          return false
        }

        if (
          typeof filters?.isFavorite === 'boolean' &&
          !!record.isFavorite !== filters.isFavorite
        ) {
          return false
        }

        return filters?.isFolder === true || !!record.data
      }) ?? []

    const sortedRecords = [...records].sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        if (sort?.key === 'updatedAt') {
          return sort?.direction === 'asc'
            ? a.updatedAt - b.updatedAt
            : b.updatedAt - a.updatedAt
        }

        if (sort?.key === 'createdAt') {
          return sort?.direction === 'asc'
            ? a.createdAt - b.createdAt
            : b.createdAt - a.createdAt
        }
      }

      return a.isPinned ? -1 : 1
    })

    return {
      isLoading: state.vault.isLoading,
      data: sortedRecords
    }
  }
