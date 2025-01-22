/**
 * @param {string} pattern
 * @param {string} value
 * @returns {boolean}
 */
export const matchPatternToValue = (pattern, value) => {
  return !!value?.toLowerCase().includes(pattern?.toLowerCase())
}
