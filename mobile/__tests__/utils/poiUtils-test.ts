import { StructureType } from "../../src/types/Building";
import { PointOfInterest } from "../../src/types/PointOfInterest";
import { poiToBuilding } from "../../src/utils/poiUtils";

const makePoi = (overrides: Partial<PointOfInterest> = {}): PointOfInterest => ({
  name: "Tim Hortons (Guy St)",
  category: "cafe",
  campus: "SGW",
  address: "1432 Guy St, Montreal, QC",
  latitude: 45.4968,
  longitude: -73.5787,
  description: "Canadian coffee chain with donuts and quick bites",
  ...overrides,
});

describe("poiToBuilding", () => {
  it("sets buildingCode, buildingName, and buildingLongName to poi.name", () => {
    const result = poiToBuilding(makePoi());
    expect(result.buildingCode).toBe("Tim Hortons (Guy St)");
    expect(result.buildingName).toBe("Tim Hortons (Guy St)");
    expect(result.buildingLongName).toBe("Tim Hortons (Guy St)");
  });

  it("maps campus correctly", () => {
    expect(poiToBuilding(makePoi({ campus: "SGW" })).campus).toBe("SGW");
    expect(poiToBuilding(makePoi({ campus: "LOY" })).campus).toBe("LOY");
  });

  it("maps address correctly", () => {
    const result = poiToBuilding(makePoi({ address: "1432 Guy St, Montreal, QC" }));
    expect(result.address).toBe("1432 Guy St, Montreal, QC");
  });

  it("maps latitude and longitude correctly", () => {
    const result = poiToBuilding(makePoi({ latitude: 45.4968, longitude: -73.5787 }));
    expect(result.latitude).toBe(45.4968);
    expect(result.longitude).toBe(-73.5787);
  });

  it("always sets structureType to StructureType.Point", () => {
    const result = poiToBuilding(makePoi());
    expect(result.structureType).toBe(StructureType.Point);
  });

  it("maps description correctly", () => {
    const result = poiToBuilding(makePoi({ description: "A cozy café" }));
    expect(result.description).toBe("A cozy café");
  });

  it("maps an empty description", () => {
    const result = poiToBuilding(makePoi({ description: "" }));
    expect(result.description).toBe("");
  });

  it("does not set polygons", () => {
    const result = poiToBuilding(makePoi());
    expect(result.polygons).toBeUndefined();
  });

  it("does not set Google_Place_Info", () => {
    const result = poiToBuilding(makePoi());
    expect(result.Google_Place_Info).toBeUndefined();
  });

  it("handles a Loyola campus POI correctly", () => {
    const poi = makePoi({
      name: "Ye Olde Orchard Pub",
      campus: "LOY",
      address: "5563 Monkland Ave, Montreal, QC",
      latitude: 45.4728,
      longitude: -73.622,
      description: "Classic pub with live music and pub food",
      category: "bar",
    });
    const result = poiToBuilding(poi);
    expect(result.campus).toBe("LOY");
    expect(result.buildingName).toBe("Ye Olde Orchard Pub");
    expect(result.structureType).toBe(StructureType.Point);
    expect(result.description).toBe("Classic pub with live music and pub food");
  });
});
