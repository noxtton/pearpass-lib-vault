import { pearpassVaultClient } from '../instances'

/**
 * @param {{recordId: string, fileId: string, buffer: ArrayBuffer}[]} files
 */
export const vaultAddFiles = async (files) => {
  if (!files?.length) {
    throw new Error('Files are required')
  }

  for (const { recordId, fileId, buffer } of files) {
    await pearpassVaultClient.activeVaultAddFile(
      `record/${recordId}/file/${fileId}`,
      buffer
    )
  }
}
