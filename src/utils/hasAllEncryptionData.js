/**
 *
 * @param {{
 *  *  ciphertext?: string
 *  *  nonce?: string
 *  *  salt?: string
 * }} params
 * @returns {boolean}
 */
export const hasAllEncryptionData = (encryptionData = {}) => {
  if (!encryptionData || typeof encryptionData !== 'object') {
    return false
  }

  const { ciphertext, nonce, salt } = encryptionData

  return !!ciphertext && !!nonce && !!salt
}
