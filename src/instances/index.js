export let vaultManager

/**
 * @param {Autopass} instance
 */
export const setVaultManager = (instance) => {
  vaultManager = instance
}

/**
 * @param {string} path
 */
export const setStoragePath = async (path) => {
  await vaultManager.setStoragePath(path)
}
