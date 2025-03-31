import { pearpassVaultClient } from '../instances'
import { getVaultEncryption } from './getVaultEncryption'
import { hasAllEncryptionData } from '../utils/hasAllEncryptionData'

/**
 * @param {{
 *  id: string
 *  name: string
 *  password: string
 * }} record
 * @returns {Promise<void>}
 */
export const createVault = async (vault) => {
  if (!vault?.id) {
    throw new Error('Vault id is required')
  }

  const activeVaultRes = await pearpassVaultClient.activeVaultGetStatus()

  if (activeVaultRes.status) {
    await pearpassVaultClient.activeVaultClose()
  }

  let encryptionKey

  if (vault.password) {
    const vaultEncryptionres = await getVaultEncryption(vault.id)

    if (hasAllEncryptionData(vaultEncryptionres)) {
      throw new Error('Vault already exists')
    }

    const encryptVaultKeyRes = await pearpassVaultClient.encryptVaultKey(
      vault.password
    )

    if (!hasAllEncryptionData(encryptVaultKeyRes)) {
      throw new Error('Error encrypting vault key')
    }

    const { ciphertext, nonce, salt } = encryptVaultKeyRes

    encryptionKey = await pearpassVaultClient.decryptVaultKey({
      password: vault.password,
      ciphertext,
      nonce,
      salt
    })

    await pearpassVaultClient.encryptionAdd(
      `vault/${vault.id}`,
      encryptVaultKeyRes
    )
  }

  await pearpassVaultClient.vaultsAdd(`vault/${vault.id}`, vault)

  await pearpassVaultClient.activeVaultInit({
    id: vault.id,
    encryptionKey
  })
  await pearpassVaultClient.activeVaultAdd(`vault`, vault)
}
