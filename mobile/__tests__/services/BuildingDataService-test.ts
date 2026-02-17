import { BuildingDataService } from "../../src/services/BuildingDataService";

// Mock fetch globally
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => { });
});

afterEach(() => {
    jest.restoreAllMocks();
});

const createApiBuilding = (overrides: Record<string, any> = {}) => ({
    Campus: "SGW",
    Building: "H",
    Building_Name: "Hall Building",
    Building_Long_Name: "Henry F. Hall Building",
    Address: "1455 De Maisonneuve Blvd. W.",
    Latitude: 45.4973,
    Longitude: -73.5789,
    Google_Place_Info: {
        displayName: { text: "Hall Building" },
        formattedAddress: "1455 De Maisonneuve Blvd W",
    },
    ...overrides,
});

test("maps Google_Place_Info from API response", async () => {
    const apiBuilding = createApiBuilding();
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [apiBuilding],
    });

    const result = await BuildingDataService.fetchBuildings();

    expect(result).toHaveLength(1);
    expect(result[0].Google_Place_Info).toEqual({
        displayName: { text: "Hall Building" },
        formattedAddress: "1455 De Maisonneuve Blvd W",
    });
});

test("maps basic building fields correctly", async () => {
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [createApiBuilding()],
    });

    const result = await BuildingDataService.fetchBuildings();

    expect(result[0]).toMatchObject({
        campus: "SGW",
        buildingCode: "H",
        buildingName: "Hall Building",
        buildingLongName: "Henry F. Hall Building",
        address: "1455 De Maisonneuve Blvd. W.",
        latitude: 45.4973,
        longitude: -73.5789,
    });
});

test("handles building without Google_Place_Info", async () => {
    const apiBuilding = createApiBuilding({ Google_Place_Info: undefined });
    mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [apiBuilding],
    });

    const result = await BuildingDataService.fetchBuildings();

    expect(result[0].Google_Place_Info).toBeUndefined();
});

test("throws on HTTP error", async () => {
    mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
    });

    await expect(BuildingDataService.fetchBuildings()).rejects.toThrow(
        "HTTP error! status: 500",
    );
});

test("throws network error with helpful message", async () => {
    mockFetch.mockRejectedValueOnce(
        new TypeError("Network request failed"),
    );

    await expect(BuildingDataService.fetchBuildings()).rejects.toThrow(
        "Cannot connect to server",
    );
});
