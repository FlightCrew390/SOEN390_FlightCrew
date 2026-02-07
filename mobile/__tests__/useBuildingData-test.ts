import { act, renderHook, waitFor } from "@testing-library/react-native";

import { useBuildingData } from "../src/hooks/useBuildingData";
import { Building } from "../src/types/Building";

// Mock BuildingDataService
const mockFetchBuildings = jest.fn();
jest.mock("../src/services/BuildingDataService", () => ({
  BuildingDataService: {
    fetchBuildings: () => mockFetchBuildings(),
  },
}));

const mockBuildings: Building[] = [
  {
    campus: "SGW",
    buildingCode: "H",
    buildingName: "Hall Building",
    buildingLongName: "Henry F. Hall Building",
    address: "1455 De Maisonneuve Blvd. W.",
    latitude: 45.4973,
    longitude: -73.5789,
  },
  {
    campus: "SGW",
    buildingCode: "EV",
    buildingName: "Engineering Building",
    buildingLongName:
      "Engineering, Computer Science and Visual Arts Integrated Complex",
    address: "1515 St. Catherine W.",
    latitude: 45.4957,
    longitude: -73.5773,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

test("initial state shows loading", () => {
  mockFetchBuildings.mockResolvedValue([]);

  const { result } = renderHook(() => useBuildingData());

  expect(result.current.loading).toBe(true);
  expect(result.current.buildings).toEqual([]);
  expect(result.current.error).toBeNull();
});

test("loads buildings successfully", async () => {
  mockFetchBuildings.mockResolvedValue(mockBuildings);

  const { result } = renderHook(() => useBuildingData());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.buildings).toEqual(mockBuildings);
  expect(result.current.error).toBeNull();
  expect(mockFetchBuildings).toHaveBeenCalledTimes(1);
});

test("handles error when fetch fails", async () => {
  const errorMessage = "Network error";
  mockFetchBuildings.mockRejectedValue(new Error(errorMessage));

  const { result } = renderHook(() => useBuildingData());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.buildings).toEqual([]);
  expect(result.current.error).toBe(errorMessage);
  expect(mockFetchBuildings).toHaveBeenCalledTimes(1);
});

test("handles non-Error exceptions", async () => {
  mockFetchBuildings.mockRejectedValue("String error");

  const { result } = renderHook(() => useBuildingData());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.buildings).toEqual([]);
  expect(result.current.error).toBe("Failed to fetch buildings");
});

test("refetch loads buildings again", async () => {
  mockFetchBuildings.mockResolvedValue(mockBuildings);

  const { result } = renderHook(() => useBuildingData());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(mockFetchBuildings).toHaveBeenCalledTimes(1);
  expect(result.current.buildings).toEqual(mockBuildings);

  // Clear and set new data
  const singleBuilding = [mockBuildings[0]];
  mockFetchBuildings.mockResolvedValue(singleBuilding);

  // Call refetch
  await act(async () => {
    await result.current.refetch();
  });

  await waitFor(() => {
    expect(result.current.buildings).toEqual(singleBuilding);
  });

  expect(mockFetchBuildings).toHaveBeenCalledTimes(2);
});

test("refetch resets error state", async () => {
  mockFetchBuildings.mockRejectedValue(new Error("Network error"));

  const { result } = renderHook(() => useBuildingData());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.error).toBe("Network error");

  // Now mock success
  mockFetchBuildings.mockResolvedValue(mockBuildings);

  // Call refetch
  await act(async () => {
    await result.current.refetch();
  });

  await waitFor(() => {
    expect(result.current.error).toBeNull();
  });

  expect(result.current.buildings).toEqual(mockBuildings);
});

test("refetch shows loading state", async () => {
  mockFetchBuildings.mockResolvedValue(mockBuildings);

  const { result } = renderHook(() => useBuildingData());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  // Refetch and check loading state
  let loadingDuringRefetch = false;
  act(() => {
    result.current.refetch();
  });

  // Check if loading is true right after calling refetch
  await waitFor(
    () => {
      if (result.current.loading) {
        loadingDuringRefetch = true;
      }
      expect(result.current.loading).toBe(false);
    },
    { timeout: 1000 },
  );

  expect(loadingDuringRefetch).toBe(true);
});
