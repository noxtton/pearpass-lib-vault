import { AutoPassInstance } from './autoPass'
import { CoreStoreInstance } from './coreStore'
import { buildPath } from './path'

/**
 * @param {string} path
 * @returns {Promise<Autopass>}
 */
export const initInstance = async (path) => {
  if (!AutoPassInstance) {
    throw new Error('AutoPassInstance is not initialized')
  }

  if (!CoreStoreInstance) {
    throw new Error('CoreStoreInstance is not initialized')
  }

  const instance = new AutoPassInstance(new CoreStoreInstance(buildPath(path)))

  await instance.ready()

  return instance
}
