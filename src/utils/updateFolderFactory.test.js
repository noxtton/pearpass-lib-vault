import { updateFolderFactory } from './updateFolderFactory'

describe('updateFolderFactory', () => {
  const mockVault = {
    data: {
      records: [
        { id: '1', type: 'note', folder: 'old', data: {} },
        { id: '2', type: 'login', folder: null, data: {} },
        { id: '3', type: 'card', folder: 'old', data: {} }
      ]
    }
  }

  it('should update the folder of the specified records', () => {
    const updated = updateFolderFactory(['1', '3'], 'new-folder', mockVault)

    expect(updated).toEqual([
      { id: '1', type: 'note', folder: 'new-folder', data: {} },
      { id: '3', type: 'card', folder: 'new-folder', data: {} }
    ])
  })

  it('should skip recordIds that are not found', () => {
    const updated = updateFolderFactory(['1', '999'], 'new-folder', mockVault)

    expect(updated).toEqual([
      { id: '1', type: 'note', folder: 'new-folder', data: {} }
    ])
  })

  it('should return undefined and log an error if no records found', () => {
    console.error = jest.fn()

    const result = updateFolderFactory(['999'], 'new-folder', mockVault)

    expect(result).toBeUndefined()
    expect(console.error).toHaveBeenCalledWith('Record not found')
  })

  it('should return an empty array if recordIds is empty', () => {
    const result = updateFolderFactory([], 'some-folder', mockVault)
    expect(result).toBeUndefined()
    expect(console.error).toHaveBeenCalledWith('Record not found')
  })
})
