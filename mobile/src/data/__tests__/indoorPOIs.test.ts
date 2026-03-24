import INDOOR_POIS from "../indoorPOIs";

describe("INDOOR_POIS", () => {
  describe("Hall building sample entries with x/y coordinates", () => {
    const hallPois = INDOOR_POIS["H"] ?? [];

    it("has H-washroom-1 on floor 1 with valid x/y", () => {
      const poi = hallPois.find((p) => p.id === "H-washroom-1");
      expect(poi).toBeDefined();
      expect(poi!.floor).toBe(1);
      expect(typeof poi!.x).toBe("number");
      expect(typeof poi!.y).toBe("number");
    });

    it("has H-washroom-8 on floor 8 with valid x/y", () => {
      const poi = hallPois.find((p) => p.id === "H-washroom-8");
      expect(poi).toBeDefined();
      expect(poi!.floor).toBe(8);
      expect(typeof poi!.x).toBe("number");
      expect(typeof poi!.y).toBe("number");
    });

    it("has H-fountain-1 on floor 1 with valid x/y", () => {
      const poi = hallPois.find((p) => p.id === "H-fountain-1");
      expect(poi).toBeDefined();
      expect(poi!.floor).toBe(1);
      expect(typeof poi!.x).toBe("number");
      expect(typeof poi!.y).toBe("number");
    });

    it("does not render entries without x/y on indoor maps (x/y are undefined)", () => {
      const poi = hallPois.find((p) => p.id === "H-fountain-5");
      expect(poi).toBeDefined();
      expect(poi!.x).toBeUndefined();
      expect(poi!.y).toBeUndefined();
    });
  });

  describe("MB building sample entries with x/y coordinates", () => {
    const mbPois = INDOOR_POIS["MB"] ?? [];

    it("has MB entries with valid x/y", () => {
      mbPois.forEach((poi) => {
        expect(typeof poi.x).toBe("number");
        expect(typeof poi.y).toBe("number");
      });
    });
  });

  describe("data shape", () => {
    it("every entry has required fields", () => {
      Object.values(INDOOR_POIS)
        .flat()
        .forEach((poi) => {
          expect(typeof poi.id).toBe("string");
          expect(typeof poi.name).toBe("string");
          expect(["washroom", "fountain", "stairs", "elevator"]).toContain(
            poi.category,
          );
          expect(typeof poi.buildingCode).toBe("string");
          expect(typeof poi.floor).toBe("number");
          expect(typeof poi.latitude).toBe("number");
          expect(typeof poi.longitude).toBe("number");
          expect(typeof poi.description).toBe("string");
        });
    });
  });
});
