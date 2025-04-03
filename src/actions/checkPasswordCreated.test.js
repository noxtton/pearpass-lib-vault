import { checkPasswordCreated } from './checkPasswordCreated'
import { getMasterPasswordEncryption } from '../api/getMasterPasswordEncryption'

jest.mock('../api/getMasterPasswordEncryption')

describe('checkPasswordCreated', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call getMasterPasswordEncryption', async () => {
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'test-ciphertext',
      nonce: 'test-nonce',
      salt: 'test-salt'
    })

    await checkPasswordCreated()(jest.fn(), jest.fn)

    expect(getMasterPasswordEncryption).toHaveBeenCalledTimes(1)
  })

  it('should return true when all necessary fields exsis', async () => {
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'test-ciphertext',
      nonce: 'test-nonce',
      salt: 'test-salt'
    })

    const result = await checkPasswordCreated()(jest.fn(), jest.fn)

    expect(result.payload).toBe(true)
  })

  it('should return false when ciphertext is missing', async () => {
    getMasterPasswordEncryption.mockResolvedValue({
      nonce: 'test-nonce',
      salt: 'test-salt'
    })

    const result = await checkPasswordCreated()(jest.fn(), jest.fn)

    expect(result.payload).toBe(false)
  })

  it('should return false when nonce is missing', async () => {
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'test-ciphertext',
      salt: 'test-salt'
    })

    const result = await checkPasswordCreated()(jest.fn(), jest.fn)

    expect(result.payload).toBe(false)
  })

  it('should return false when salt is missing', async () => {
    getMasterPasswordEncryption.mockResolvedValue({
      ciphertext: 'test-ciphertext',
      nonce: 'test-nonce'
    })

    const result = await checkPasswordCreated()(jest.fn(), jest.fn)

    expect(result.payload).toBe(false)
  })
})
