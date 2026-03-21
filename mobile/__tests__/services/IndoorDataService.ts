import { IndoorNode } from "../../src/types/IndoorRoom";

const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

const createNode = (overrides: Partial<IndoorNode> = {}): IndoorNode => ({
  id: "node-1",
  type: "room",
  buildingId: "Hall",
  floor: 1,
  x: 0,
  y: 0,
  label: "H-101",
  accessible: true,
  ...overrides,
});

const loadIndoorDataService = () => {
  let indoorDataService!: {
    ensureLoaded: () => Promise<void>;
    getAllNodes: () => IndoorNode[];
    getRooms: () => IndoorNode[];
    getAvailableBuildings: () => string[];
    getFloorsByBuilding: (buildingId: string) => number[];
    getRoomsByBuilding: (buildingId: string) => IndoorNode[];
    getRoomsByBuildingAndFloor: (
      buildingId: string,
      floor: number,
    ) => IndoorNode[];
    searchRooms: (query: string) => IndoorNode[];
    searchRoomsByBuilding: (query: string, buildingId: string) => IndoorNode[];
  };

  jest.isolateModules(() => {
    indoorDataService = jest.requireActual(
      "../../src/services/IndoorDataService",
    ).IndoorDataService;
  });

  return indoorDataService;
};

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe("IndoorDataService", () => {
  it("loads buildings and rooms successfully", async () => {
    const nodes = [
      createNode({ id: "r1", label: "H-101", floor: 1 }),
      createNode({ id: "r2", label: "H-201", floor: 2 }),
      createNode({
        id: "w1",
        type: "hallway_waypoint",
        label: "Waypoint",
        floor: 2,
      }),
    ];

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ["Hall", "MB"],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => nodes,
      });

    const IndoorDataService = loadIndoorDataService();
    await IndoorDataService.ensureLoaded();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(IndoorDataService.getAvailableBuildings()).toEqual(["Hall", "MB"]);
    expect(IndoorDataService.getAllNodes()).toEqual(nodes);
    expect(IndoorDataService.getRooms()).toHaveLength(2);
  });

  it("does not refetch once data is already loaded", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ["Hall"],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [createNode()],
      });

    const IndoorDataService = loadIndoorDataService();
    await IndoorDataService.ensureLoaded();

    mockFetch.mockClear();
    await IndoorDataService.ensureLoaded();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("reuses the in-flight loading promise", async () => {
    let resolveBuildings!: (value: unknown) => void;
    let resolveRooms!: (value: unknown) => void;

    const buildingsResponse = new Promise((resolve) => {
      resolveBuildings = resolve;
    });

    const roomsResponse = new Promise((resolve) => {
      resolveRooms = resolve;
    });

    mockFetch
      .mockReturnValueOnce(buildingsResponse)
      .mockReturnValueOnce(roomsResponse);

    const IndoorDataService = loadIndoorDataService();
    const firstCall = IndoorDataService.ensureLoaded();
    const secondCall = IndoorDataService.ensureLoaded();

    expect(mockFetch).toHaveBeenCalledTimes(2);

    resolveBuildings({ ok: true, json: async () => ["Hall"] });
    resolveRooms({ ok: true, json: async () => [createNode()] });

    await expect(Promise.all([firstCall, secondCall])).resolves.toEqual([
      undefined,
      undefined,
    ]);
  });

  it("keeps default buildings when buildings response is empty", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [createNode()],
      });

    const IndoorDataService = loadIndoorDataService();
    await IndoorDataService.ensureLoaded();

    expect(IndoorDataService.getAvailableBuildings()).toEqual([
      "Hall",
      "CC",
      "MB",
      "VE",
      "VL",
    ]);
  });

  it("uses dynamic sorted floors when node data is available", async () => {
    const nodes = [
      createNode({ id: "r1", floor: 9 }),
      createNode({ id: "r2", floor: 2 }),
      createNode({ id: "r3", floor: 2 }),
      createNode({ id: "r4", buildingId: "MB", floor: 1 }),
    ];

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ["Hall", "MB"] })
      .mockResolvedValueOnce({ ok: true, json: async () => nodes });

    const IndoorDataService = loadIndoorDataService();
    await IndoorDataService.ensureLoaded();

    expect(IndoorDataService.getFloorsByBuilding("Hall")).toEqual([2, 9]);
  });

  it("falls back to defaults for floors when no nodes are available", async () => {
    const IndoorDataService = loadIndoorDataService();

    expect(IndoorDataService.getFloorsByBuilding("Hall")).toEqual([1, 2, 8, 9]);
    expect(IndoorDataService.getFloorsByBuilding("Unknown")).toEqual([1]);
    expect(IndoorDataService.getFloorsByBuilding("")).toEqual([]);
  });

  it("filters rooms by building and floor", async () => {
    const nodes = [
      createNode({ id: "h1", buildingId: "Hall", floor: 1, label: "H-100" }),
      createNode({ id: "h2", buildingId: "Hall", floor: 2, label: "H-200" }),
      createNode({ id: "m1", buildingId: "MB", floor: 1, label: "MB-100" }),
      createNode({
        id: "waypoint",
        type: "hallway_waypoint",
        buildingId: "Hall",
        floor: 1,
      }),
    ];

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ["Hall", "MB"] })
      .mockResolvedValueOnce({ ok: true, json: async () => nodes });

    const IndoorDataService = loadIndoorDataService();
    await IndoorDataService.ensureLoaded();

    expect(IndoorDataService.getRoomsByBuilding("Hall")).toHaveLength(2);
    expect(IndoorDataService.getRoomsByBuildingAndFloor("Hall", 1)).toEqual([
      expect.objectContaining({ id: "h1" }),
    ]);
  });

  it("searches room labels case-insensitively and trims query", async () => {
    const nodes = [
      createNode({ id: "h1", label: "H-110" }),
      createNode({ id: "h2", label: "Hall Auditorium" }),
      createNode({ id: "m1", buildingId: "MB", label: "MB-101" }),
    ];

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ["Hall", "MB"] })
      .mockResolvedValueOnce({ ok: true, json: async () => nodes });

    const IndoorDataService = loadIndoorDataService();
    await IndoorDataService.ensureLoaded();

    expect(IndoorDataService.searchRooms(" hall ")).toHaveLength(1);
    expect(IndoorDataService.searchRoomsByBuilding("h-", "Hall")).toHaveLength(
      1,
    );
    expect(IndoorDataService.searchRooms("   ")).toEqual([]);
  });

  it("swallows fetch errors and keeps safe defaults", async () => {
    mockFetch.mockRejectedValue(new Error("network down"));

    const IndoorDataService = loadIndoorDataService();

    await expect(IndoorDataService.ensureLoaded()).resolves.toBeUndefined();
    expect(IndoorDataService.getAvailableBuildings()).toEqual([
      "Hall",
      "CC",
      "MB",
      "VE",
      "VL",
    ]);
    expect(IndoorDataService.getAllNodes()).toEqual([]);
  });
});
