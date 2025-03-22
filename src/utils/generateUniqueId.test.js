import { generateUniqueId } from './generateUniqueId'

describe('generateUniqueId', () => {
  it('should return a string', () => {
    const id = generateUniqueId()
    expect(typeof id).toBe('string')
  })

  it('should return a non-empty string', () => {
    const id = generateUniqueId()
    expect(id.length).toBeGreaterThan(0)
  })

  it('should return unique values when called multiple times', () => {
    const id1 = generateUniqueId()
    const id2 = generateUniqueId()
    expect(id1).not.toBe(id2)
  })

  it('should contain both timestamp and random parts', () => {
    const originalNow = Date.now
    const mockTimestamp = 1609459200000
    Date.now = jest.fn(() => mockTimestamp)

    const id = generateUniqueId()

    expect(id.startsWith(mockTimestamp.toString(36))).toBe(true)

    Date.now = originalNow
  })
})
