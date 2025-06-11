import { matchPatternToValue } from "pear-apps-utils-pattern-search";

import { selectDevices } from "./selectDevices";

jest.mock("pear-apps-utils-pattern-search", () => ({
  matchPatternToValue: jest.fn(),
}));

describe("selectDevices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockState = {
    vault: {
      isLoading: false,
      data: {
        devices: [
          {
            id: "1",
            data: { title: "Work Password" },
            createdAt: 100,
            updatedAt: 200,
          },
          {
            id: "2",
            data: { title: "Personal Password" },
            createdAt: 300,
            updatedAt: 400,
          },
          {
            id: "3",
            data: { title: "Work Note" },
            createdAt: 150,
            updatedAt: 250,
          },
          {
            id: "4",
            data: { title: "No Folder" },
            createdAt: 50,
            updatedAt: 150,
          },
          {
            id: "5",
            createdAt: 200,
            updatedAt: 300,
          },
        ],
      },
    },
  };

  test("should return all devices when no filters are provided", () => {
    const selector = selectDevices();
    const result = selector(mockState);

    expect(result.isLoading).toBe(false);
    expect(result.data).toHaveLength(4);
    expect(result.data[0].id).toBe("1");
  });

  test("should filter by null folder", () => {
    const selector = selectDevices({ filters: { folder: null } });
    const result = selector(mockState);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("4");
  });

  test("should filter by type", () => {
    const selector = selectDevices({ filters: { type: "note" } });
    const result = selector(mockState);

    expect(result.data).toHaveLength(1);
    expect(result.data[0].type).toBe("note");
  });

  test("should filter by search pattern", () => {
    matchPatternToValue.mockImplementation((pattern, value) => {
      if (value && pattern === "work") {
        return value.toLowerCase().includes("work");
      }
      return false;
    });

    const selector = selectDevices({ filters: { searchPattern: "work" } });
    const result = selector(mockState);

    expect(matchPatternToValue).toHaveBeenCalled();
    expect(result.data.length).toBeGreaterThan(0);
  });

  test("should sort by updatedAt in ascending order", () => {
    const selector = selectDevices({
      sort: { key: "updatedAt", direction: "asc" },
    });
    const result = selector(mockState);

    expect(result.data[0].id).toBe("1");
    expect(result.data[1].updatedAt).toBeLessThan(result.data[2].updatedAt);
  });

  test("should sort by updatedAt in descending order", () => {
    const selector = selectDevices({
      sort: { key: "updatedAt", direction: "desc" },
    });
    const result = selector(mockState);

    expect(result.data[0].id).toBe("1");
    expect(result.data[1].updatedAt).toBeGreaterThan(result.data[2].updatedAt);
  });

  test("should sort by createdAt", () => {
    const selector = selectDevices({
      sort: { key: "createdAt", direction: "desc" },
    });
    const result = selector(mockState);

    expect(result.data[0].id).toBe("1");
    expect(result.data[1].createdAt).toBeGreaterThan(result.data[2].createdAt);
  });

  test("should handle empty state gracefully", () => {
    const emptyState = { vault: {} };
    const selector = selectDevices();
    const result = selector(emptyState);

    expect(result.data).toEqual([]);
  });
});
