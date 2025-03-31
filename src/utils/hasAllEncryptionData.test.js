import { hasAllEncryptionData } from './hasAllEncryptionData'

describe('hasAllEncryptionData', () => {
  it('should return true when all encryption data is present', () => {
    const encryptionData = {
      ciphertext: 'some-ciphertext',
      nonce: 'some-nonce',
      salt: 'some-salt'
    }
    expect(hasAllEncryptionData(encryptionData)).toBe(true)
  })

  it('should return false when ciphertext is missing', () => {
    const encryptionData = {
      nonce: 'some-nonce',
      salt: 'some-salt'
    }
    expect(hasAllEncryptionData(encryptionData)).toBe(false)
  })

  it('should return false when nonce is missing', () => {
    const encryptionData = {
      ciphertext: 'some-ciphertext',
      salt: 'some-salt'
    }
    expect(hasAllEncryptionData(encryptionData)).toBe(false)
  })

  it('should return false when salt is missing', () => {
    const encryptionData = {
      ciphertext: 'some-ciphertext',
      nonce: 'some-nonce'
    }
    expect(hasAllEncryptionData(encryptionData)).toBe(false)
  })

  it('should return false when encryptionData is null', () => {
    expect(hasAllEncryptionData(null)).toBe(false)
  })

  it('should return false when encryptionData is undefined', () => {
    expect(hasAllEncryptionData(undefined)).toBe(false)
  })

  it('should return false when encryptionData is not an object', () => {
    expect(hasAllEncryptionData('string')).toBe(false)
  })

  it('should return false when all values are falsy', () => {
    const encryptionData = {
      ciphertext: '',
      nonce: '',
      salt: ''
    }
    expect(hasAllEncryptionData(encryptionData)).toBe(false)
  })
})
