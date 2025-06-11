import { pearpassVaultClient } from "../instances";

/**
 * @returns {Promise<Array<Object>>}
 */
export const listDevices = async () => {
  const devices = await pearpassVaultClient.activeVaultList(`device/`);

  return devices;
};
