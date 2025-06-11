import { generateUniqueId } from "./generateUniqueId";
import { validateAndPrepareDevice } from "./validateAndPrepareDevice";

/**
 * @param {{
 *  data: object,
 * }} payload
 * @param {string} vaultId
 * @returns {Object}
 */
export const addDeviceFactory = (payload, vaultId) => {
  if (!payload || !vaultId) {
    throw new Error("Payload and vaultId are required");
  }

  const device = {
    id: generateUniqueId(),
    vaultId: vaultId,
    data: payload.data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return validateAndPrepareDevice(device);
};
