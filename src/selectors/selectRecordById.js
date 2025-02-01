export const selectRecordById = (id) => (state) => {
  return {
    isLoading: state.vault.isRecordLoading,
    data: state.vault.data?.records?.find((record) => record.id === id)
  }
}
