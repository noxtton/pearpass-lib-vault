// TextEncoder polyfill for test environment
import util from 'util'
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = util.TextEncoder
  globalThis.TextDecoder = util.TextDecoder
}

import {
  stringToBuffer,
  bufferToString,
  clearBuffer,
  withBuffer,
  compareBuffers
} from './buffer'

describe('buffer utilities', () => {
  describe('stringToBuffer', () => {
    it('should convert string to Uint8Array', () => {
      const str = 'test'
      const buffer = stringToBuffer(str)

      expect(buffer).toBeTruthy()
      expect(typeof buffer.length).toBe('number')
      expect(buffer.length).toBe(4)
    })

    it('should correctly encode UTF-8', () => {
      const buffer = stringToBuffer('test')
      expect(Array.from(buffer)).toEqual([116, 101, 115, 116])
    })

    it('should handle empty string', () => {
      const buffer = stringToBuffer('')
      expect(buffer.length).toBe(0)
    })

    it('should handle unicode', () => {
      const buffer = stringToBuffer('🔒')
      expect(buffer.length).toBeGreaterThan(1)
    })

    it('should throw TypeError for non-string', () => {
      expect(() => stringToBuffer(123)).toThrow(TypeError)
      expect(() => stringToBuffer(null)).toThrow(TypeError)
    })
  })

  describe('bufferToString', () => {
    it('should convert buffer to string', () => {
      const buffer = stringToBuffer('hello')
      const str = bufferToString(buffer)
      expect(str).toBe('hello')
    })

    it('should handle empty buffer', () => {
      const buffer = new Uint8Array(0)
      const str = bufferToString(buffer)
      expect(str).toBe('')
    })

    it('should handle unicode', () => {
      const original = '🔒test'
      const buffer = stringToBuffer(original)
      const str = bufferToString(buffer)
      expect(str).toBe(original)
    })
  })

  describe('clearBuffer', () => {
    it('should zero out buffer', () => {
      const buffer = stringToBuffer('test')
      expect(Array.from(buffer).some((byte) => byte !== 0)).toBe(true)

      clearBuffer(buffer)
      expect(Array.from(buffer).every((byte) => byte === 0)).toBe(true)
    })

    it('should handle null gracefully', () => {
      expect(() => clearBuffer(null)).not.toThrow()
    })

    it('should handle undefined gracefully', () => {
      expect(() => clearBuffer(undefined)).not.toThrow()
    })

    it('should work with empty buffer', () => {
      const buffer = new Uint8Array(0)
      expect(() => clearBuffer(buffer)).not.toThrow()
    })
  })

  describe('withBuffer', () => {
    it('should execute callback and clear buffer', async () => {
      const buffer = stringToBuffer('test')
      let capturedBuffer

      const result = await withBuffer(buffer, async (buf) => {
        capturedBuffer = buf
        expect(Array.from(buf).some((byte) => byte !== 0)).toBe(true)
        return 'success'
      })

      expect(result).toBe('success')
      expect(Array.from(capturedBuffer).every((byte) => byte === 0)).toBe(true)
    })

    it('should clear buffer even if callback throws', async () => {
      const buffer = stringToBuffer('test')
      let capturedBuffer

      await expect(
        withBuffer(buffer, async (buf) => {
          capturedBuffer = buf
          throw new Error('Test error')
        })
      ).rejects.toThrow('Test error')

      expect(Array.from(capturedBuffer).every((byte) => byte === 0)).toBe(true)
    })
  })

  describe('compareBuffers', () => {
    it('should return true for identical buffers', () => {
      const a = stringToBuffer('test')
      const b = stringToBuffer('test')
      expect(compareBuffers(a, b)).toBe(true)
    })

    it('should return false for different buffers', () => {
      const a = stringToBuffer('test1')
      const b = stringToBuffer('test2')
      expect(compareBuffers(a, b)).toBe(false)
    })

    it('should return false for different lengths', () => {
      const a = stringToBuffer('short')
      const b = stringToBuffer('muchlonger')
      expect(compareBuffers(a, b)).toBe(false)
    })

    it('should return true for empty buffers', () => {
      const a = new Uint8Array(0)
      const b = new Uint8Array(0)
      expect(compareBuffers(a, b)).toBe(true)
    })

    it('should throw TypeError for non-buffers', () => {
      const buffer = stringToBuffer('test')
      expect(() => compareBuffers('not buffer', buffer)).toThrow(TypeError)
      expect(() => compareBuffers(buffer, null)).toThrow(TypeError)
    })
  })

  describe('integration', () => {
    it('should handle full string->buffer->clear cycle', () => {
      const original = 'sensitive data'
      const buffer = stringToBuffer(original)

      expect(bufferToString(buffer)).toBe(original)

      clearBuffer(buffer)
      expect(Array.from(buffer).every((byte) => byte === 0)).toBe(true)
    })
  })
})
