import { AutoPassInstance } from './autoPass'
import { CoreStoreInstance } from './coreStore'
import { buildPath } from './path'

/**
 * @param {string} path
 * @returns {Promise<Autopass>}
 */
export const pairInstance = async (path, invite) => {
  if (!AutoPassInstance) {
    throw new Error('AutoPassInstance is not initialized')
  }

  if (!CoreStoreInstance) {
    throw new Error('CoreStoreInstance is not initialized')
  }

  const pair = AutoPassInstance.pair(
    new CoreStoreInstance(buildPath(path)),
    invite
  )

  const instance = await pair.finished()

  await instance.ready()

  await instance.close()
}
