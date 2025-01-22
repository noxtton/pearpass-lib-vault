import { selectRecords } from './selectRecords'

export const selectFolders = (filters) => (state) => {
  const { isLoading, data: records } = selectRecords({
    filters: {
      searchPattern: filters?.searchPattern,
      isFolder: true
    }
  })(state)

  return {
    isLoading: isLoading,
    data: records?.reduce(
      (acc, record) => {
        const folder = record.folder

        if (!folder) {
          acc.noFolder.records.push(record)

          return acc
        }

        if (!acc.customFolders?.[folder]) {
          acc.customFolders[folder] = {
            name: folder,
            records: []
          }
        }

        if (record.isFavorite) {
          acc.favorites.records.push(record)

          return acc
        }

        acc.customFolders[folder].records.push(record)

        return acc
      },
      {
        favorites: { records: [] },
        noFolder: { records: [] },
        customFolders: {}
      }
    )
  }
}
