export const updateFolderFactory = (recordIds, folder, vault) => {
  const records = recordIds
    .reduce((acc, id) => {
      const foundRecord = vault.data.records.find((r) => r.id === id)

      if (foundRecord) {
        acc.push({
          ...foundRecord,
          folder
        })
      }

      return acc
    }, [])

    .filter((record) => record !== undefined)

  if (records.length === 0) {
    console.error('Record not found')
    return undefined
  }

  return records
}
