let STORAGE_PATH = null

/**
 * @param {string} path
 * @returns {string}
 */
export const buildPath = (path) => {
  if (!STORAGE_PATH) {
    throw new Error('Storage path not set')
  }

  return STORAGE_PATH + '/' + path
}

/**
 * @param {string} path
 */
export const setStoragePath = (path) => {
  STORAGE_PATH = path
}
