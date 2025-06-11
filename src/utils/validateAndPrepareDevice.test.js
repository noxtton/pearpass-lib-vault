import { validateAndPrepareDevice } from "./validateAndPrepareDevice";

describe("validateAndPrepareDevice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should preserve folder when provided", () => {
    const mockDevice = {
      id: "test-id-123",
      type: "login",
      vaultId: "vault-123",
      data: { username: "test" },
      folder: "my-folder",
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890,
    };

    const result = validateAndPrepareDevice(mockDevice);
    expect(result.folder).toBe("my-folder");
  });

  test("should throw error for invalid device", () => {
    const mockDevice = {
      id: "test-id-123",
      type: "login",
      data: { username: "test" },
      isFavorite: false,
      createdAt: 1234567890,
      updatedAt: 1234567890,
    };

    expect(() => validateAndPrepareDevice(mockDevice)).toThrow(
      "Invalid device data"
    );
  });
});
