const STORAGE_PATH = Pear.config.storage

/**
 * @param {string} path
 * @returns {string}
 */
export const buildPath = (path) => {
  return STORAGE_PATH + '/' + path
}
