import { act, renderHook } from "@testing-library/react";
import { useDispatch, useSelector } from "react-redux";

import { addDevice as addDeviceAction } from "../actions/addDevice";
import { selectVault } from "../selectors/selectVault";
import { useAddDevice } from "./useAddDevice";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("../actions/addDevice", () => ({
  addDevice: jest.fn(),
}));

jest.mock("../selectors/selectVault", () => ({
  selectVault: jest.fn(),
}));

describe("useAddDevice", () => {
  let mockDispatch;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch = jest.fn();
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isDeviceLoading: false };
      }
      return {};
    });
  });

  it("should return isLoading state from selector", () => {
    useSelector.mockImplementation((selector) => {
      if (selector === selectVault) {
        return { isDeviceLoading: true };
      }
      return {};
    });

    const { result } = renderHook(() => useAddDevice());
    expect(result.current.isLoading).toBe(true);
  });

  it("should call addDevice action with device data", async () => {
    const device = { title: "Test Device", content: "Test Content" };
    mockDispatch.mockResolvedValue({ error: false, payload: { device } });
    addDeviceAction.mockReturnValue("ACTION");

    const { result } = renderHook(() => useAddDevice());

    await act(async () => {
      await result.current.addDevice(device);
    });

    expect(addDeviceAction).toHaveBeenCalledWith(device);
    expect(mockDispatch).toHaveBeenCalledWith("ACTION");
  });

  it("should call onCompleted callback when device is add successfully", async () => {
    const device = { title: "Test Device", content: "Test Content" };
    const payload = { device };
    const onCompleted = jest.fn();
    mockDispatch.mockResolvedValue({ error: false, payload });

    const { result } = renderHook(() => useAddDevice({ onCompleted }));

    await act(async () => {
      await result.current.addDevice(device);
    });

    expect(onCompleted).toHaveBeenCalledWith(payload);
  });

  it("should not call onCompleted callback when there is an error", async () => {
    const device = { title: "Test Device", content: "Test Content" };
    const onCompleted = jest.fn();
    mockDispatch.mockResolvedValue({ error: true });

    const { result } = renderHook(() => useAddDevice({ onCompleted }));

    await act(async () => {
      await result.current.addDevice(device);
    });

    expect(onCompleted).not.toHaveBeenCalled();
  });
});
