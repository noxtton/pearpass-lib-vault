import { createDevice as createDeviceApi } from "../api/createDevice";
import { generateUniqueId } from "../utils/generateUniqueId";
import { validateAndPrepareDevice } from "../utils/validateAndPrepareDevice";
import { createDevice } from "./createDevice";

jest.mock("../api/createDevice", () => ({
  createDevice: jest.fn(),
}));

jest.mock("../utils/generateUniqueId", () => ({
  generateUniqueId: jest.fn(),
}));

jest.mock("../utils/validateAndPrepareDevice", () => ({
  validateAndPrepareDevice: jest.fn((device) => device),
}));

describe("createDevice", () => {
  const mockVaultId = "vault-123";
  const mockDeviceId = "device-456";
  const mockDate = 1633000000000;
  const mockPayload = {
    data: { username: "testuser", password: "testpass" },
  };

  let dispatch;
  let getState;

  beforeEach(() => {
    jest.clearAllMocks();

    global.Date.now = jest.fn().mockReturnValue(mockDate);

    generateUniqueId.mockReturnValue(mockDeviceId);

    dispatch = jest.fn();
    getState = jest.fn().mockReturnValue({
      vault: {
        data: {
          id: mockVaultId,
        },
      },
    });

    createDeviceApi.mockResolvedValue({});
    validateAndPrepareDevice.mockImplementation((device) => device);
  });

  it("should create a device with correct properties", async () => {
    const thunk = createDevice(mockPayload);
    const result = await thunk(dispatch, getState);

    expect(result.payload).toEqual({
      id: mockDeviceId,
      vaultId: mockVaultId,
      data: mockPayload.data,
      createdAt: mockDate,
      updatedAt: mockDate,
    });
  });

  it("should call createDeviceApi with correct parameters", async () => {
    const thunk = createDevice(mockPayload);
    await thunk(dispatch, getState);

    expect(createDeviceApi).toHaveBeenCalledWith({
      id: mockDeviceId,
      vaultId: mockVaultId,
      data: mockPayload.data,
      createdAt: mockDate,
      updatedAt: mockDate,
    });
  });

  it("should throw an error if validation fails", async () => {
    validateAndPrepareDevice.mockImplementation(() => {
      throw new Error("Validation error");
    });

    const thunk = createDevice(mockPayload);

    const result = await thunk(dispatch, getState);

    await expect(result.type).toBe(createDevice.rejected.type);

    expect(createDeviceApi).not.toHaveBeenCalled();
  });

  it("should generate a unique ID for the device", async () => {
    const thunk = createDevice(mockPayload);
    await thunk(dispatch, getState);

    expect(generateUniqueId).toHaveBeenCalled();
  });
});
