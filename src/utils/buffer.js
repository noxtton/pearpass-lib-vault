/**
 * Generic buffer utilities for string/buffer conversions and secure clearing
 */

/**
 * Convert string to UTF-8 encoded Uint8Array
 * @param {string} str
 * @returns {Uint8Array}
 */
export const stringToBuffer = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError('Input must be a string')
  }

  const encoder = new TextEncoder()
  return encoder.encode(str)
}

/**
 * Convert Uint8Array to UTF-8 string
 * @param {Uint8Array} buffer
 * @returns {string}
 */
export const bufferToString = (buffer) => {
  const decoder = new TextDecoder()
  return decoder.decode(buffer)
}

/**
 * Clear buffer by overwriting with zeros
 * @param {Uint8Array} buffer
 */
export const clearBuffer = (buffer) => {
  if (buffer && typeof buffer === 'object' && typeof buffer.length === 'number') {
    if (typeof buffer.fill === 'function') {
      buffer.fill(0)
    } else {
      // Fallback for arrays without fill()
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = 0
      }
    }
  }
}

/**
 * Execute callback with buffer, then clear it automatically
 * @template T
 * @param {Uint8Array} buffer
 * @param {(buffer: Uint8Array) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export const withBuffer = async (buffer, callback) => {
  try {
    return await callback(buffer)
  } finally {
    clearBuffer(buffer)
  }
}

/**
 * Compare two buffers in constant time
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {boolean}
 */
export const compareBuffers = (a, b) => {
  const isUint8ArrayLike = (obj) =>
    obj &&
    typeof obj === 'object' &&
    typeof obj.length === 'number' &&
    typeof obj.buffer !== 'undefined'

  if (!isUint8ArrayLike(a) || !isUint8ArrayLike(b)) {
    throw new TypeError('Both arguments must be Uint8Array')
  }

  if (a.length !== b.length) {
    return false
  }

  // Constant-time comparison using bitwise XOR
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i]
  }

  return result === 0
}
