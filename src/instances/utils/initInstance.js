import Autopass from 'autopass'
import Corestore from 'corestore'

import { buildPath } from './path'

/**
 * @param {string} path
 * @returns {Promise<Autopass>}
 */
export const initInstance = async (path) => {
  const instance = new Autopass(new Corestore(buildPath(path)))

  await instance.ready()

  return instance
}
