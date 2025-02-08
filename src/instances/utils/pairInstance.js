import Autopass from 'autopass'
import Corestore from 'corestore'

import { buildPath } from './path'

/**
 * @param {string} path
 * @returns {Promise<Autopass>}
 */
export const pairInstance = async (path, invite) => {
  const pair = Autopass.pair(new Corestore(buildPath(path)), invite)

  const instance = await pair.finished()

  await instance.ready()

  await instance.close()
}
