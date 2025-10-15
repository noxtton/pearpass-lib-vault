import { pearpassVaultClient } from '../instances'
import { checkVaultIsProtected } from './checkVaultIsProtected'
import { getMasterPasswordEncryption } from './getMasterPasswordEncryption'
import { initActiveVaultWithCredentials } from './initActiveVaultWithCredentials'
import { listVaults } from './listVaults'

export const getUnprotectedVaultById = async (vaultId) => {
  let currentVault

  const vaults = await listVaults()

  if (!vaults.some((vault) => vault.id === vaultId)) {
    throw new Error('Vault not found')
  }

  const res = await pearpassVaultClient.activeVaultGetStatus()

  if (res?.status) {
    currentVault = await pearpassVaultClient.activeVaultGet(`vault`)

    if (currentVault && vaultId === currentVault.id) {
      return currentVault
    } else {
      await pearpassVaultClient.activeVaultClose()
    }
  }

  const masterEncryption = await getMasterPasswordEncryption()

  const encryptionKey = await pearpassVaultClient.decryptVaultKey({
    hashedPassword: masterEncryption.hashedPassword,
    ciphertext: masterEncryption.ciphertext,
    nonce: masterEncryption.nonce
  })

  await pearpassVaultClient.activeVaultInit({ id: vaultId, encryptionKey })

  const vault = await pearpassVaultClient.activeVaultGet(`vault`)

  const encryption = (await checkVaultIsProtected(currentVault.id))
    ? currentVault.encryption
    : masterEncryption

  await initActiveVaultWithCredentials(currentVault.id, encryption)

  return vault
}
