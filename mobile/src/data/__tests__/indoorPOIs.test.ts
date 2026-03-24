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

    it("VE entries have no x/y", () => {
      const vePois = INDOOR_POIS["VE"] ?? [];
      expect(vePois.length).toBeGreaterThan(0);
      vePois.forEach((poi) => {
        expect(poi.x).toBeUndefined();
        expect(poi.y).toBeUndefined();
      });
    });

    it("VL entries have no x/y", () => {
      const vlPois = INDOOR_POIS["VL"] ?? [];
      expect(vlPois.length).toBeGreaterThan(0);
      vlPois.forEach((poi) => {
        expect(poi.x).toBeUndefined();
        expect(poi.y).toBeUndefined();
      });
    });
  });

  describe("Hall building floor coverage", () => {
    const hallPois = INDOOR_POIS["H"] ?? [];

    it("has entries for floor 2", () => {
      const floor2 = hallPois.filter((p) => p.floor === 2);
      expect(floor2.length).toBeGreaterThan(0);
    });

    it("has H-washroom-2 with x/y on floor 2", () => {
      const poi = hallPois.find((p) => p.id === "H-washroom-2");
      expect(poi).toBeDefined();
      expect(poi!.floor).toBe(2);
      expect(typeof poi!.x).toBe("number");
      expect(typeof poi!.y).toBe("number");
    });

    it("has elevator on floor 2 with x/y", () => {
      const poi = hallPois.find((p) => p.id === "H-elevator-2");
      expect(poi).toBeDefined();
      expect(poi!.floor).toBe(2);
      expect(typeof poi!.x).toBe("number");
      expect(typeof poi!.y).toBe("number");
    });

    it("has entries for floor 8 beyond washroom", () => {
      const floor8 = hallPois.filter((p) => p.floor === 8);
      const categories = floor8.map((p) => p.category);
      expect(categories).toContain("washroom");
      expect(categories).toContain("fountain");
      expect(categories).toContain("stairs");
      expect(categories).toContain("elevator");
    });

    it("has entries for floor 9", () => {
      const floor9 = hallPois.filter((p) => p.floor === 9);
      expect(floor9.length).toBeGreaterThan(0);
      const categories = floor9.map((p) => p.category);
      expect(categories).toContain("washroom");
      expect(categories).toContain("fountain");
      expect(categories).toContain("stairs");
      expect(categories).toContain("elevator");
    });

    it("has H-washroom-9 with x/y on floor 9", () => {
      const poi = hallPois.find((p) => p.id === "H-washroom-9");
      expect(poi).toBeDefined();
      expect(poi!.floor).toBe(9);
      expect(typeof poi!.x).toBe("number");
      expect(typeof poi!.y).toBe("number");
    });
  });

  describe("Hall building additional floor coverage (floors 3–7, 10–11)", () => {
    const hallPois = INDOOR_POIS["H"] ?? [];

    it.each([3, 4, 5, 6, 7, 10, 11])(
      "floor %i has all four amenity categories",
      (floor) => {
        const floorPois = hallPois.filter((p) => p.floor === floor);
        const categories = floorPois.map((p) => p.category);
        expect(categories).toContain("washroom");
        expect(categories).toContain("stairs");
        expect(categories).toContain("elevator");
      },
    );

    it("floors 3–7, 10–11 have no x/y (no SVG floor plans)", () => {
      const noMapFloors = new Set([3, 4, 5, 6, 7, 10, 11]);
      hallPois
        .filter((p) => noMapFloors.has(p.floor))
        .forEach((poi) => {
          expect(poi.x).toBeUndefined();
          expect(poi.y).toBeUndefined();
        });
    });

    it("Hall now covers all 11 floors", () => {
      const floors = new Set(hallPois.map((p) => p.floor));
      for (let f = 1; f <= 11; f++) {
        expect(floors).toContain(f);
      }
    });
  });

  describe("VE building entries", () => {
    const vePois = INDOOR_POIS["VE"] ?? [];

    it("has entries for both floors 1 and 2", () => {
      const floors = new Set(vePois.map((p) => p.floor));
      expect(floors).toContain(1);
      expect(floors).toContain(2);
    });

    it("has all four amenity categories", () => {
      const categories = vePois.map((p) => p.category);
      expect(categories).toContain("washroom");
      expect(categories).toContain("fountain");
      expect(categories).toContain("stairs");
      expect(categories).toContain("elevator");
    });

    it("has elevator on floor 1", () => {
      const poi = vePois.find((p) => p.id === "VE-elevator-1" && p.floor === 1);
      expect(poi).toBeDefined();
      expect(poi!.category).toBe("elevator");
    });

    it("has elevator on floor 2", () => {
      const poi = vePois.find((p) => p.id === "VE-elevator-2" && p.floor === 2);
      expect(poi).toBeDefined();
      expect(poi!.category).toBe("elevator");
    });

    it("all entries have buildingCode VE", () => {
      vePois.forEach((poi) => expect(poi.buildingCode).toBe("VE"));
    });
  });

  describe("VL building entries", () => {
    const vlPois = INDOOR_POIS["VL"] ?? [];

    it("has entries for both floors 1 and 2", () => {
      const floors = new Set(vlPois.map((p) => p.floor));
      expect(floors).toContain(1);
      expect(floors).toContain(2);
    });

    it("has all four amenity categories", () => {
      const categories = vlPois.map((p) => p.category);
      expect(categories).toContain("washroom");
      expect(categories).toContain("fountain");
      expect(categories).toContain("stairs");
      expect(categories).toContain("elevator");
    });

    it("has elevator on floor 1", () => {
      const poi = vlPois.find((p) => p.id === "VL-elevator-1" && p.floor === 1);
      expect(poi).toBeDefined();
      expect(poi!.category).toBe("elevator");
    });

    it("all entries have buildingCode VL", () => {
      vlPois.forEach((poi) => expect(poi.buildingCode).toBe("VL"));
    });
  });

  describe("MB building entries", () => {
    const mbPois = INDOOR_POIS["MB"] ?? [];

    it("has entries for floors 1, 2, and 3", () => {
      const floors = new Set(mbPois.map((p) => p.floor));
      expect(floors).toContain(1);
      expect(floors).toContain(2);
      expect(floors).toContain(3);
    });

    it("each floor has all four amenity categories", () => {
      for (const floor of [1, 2, 3]) {
        const categories = mbPois
          .filter((p) => p.floor === floor)
          .map((p) => p.category);
        expect(categories).toContain("washroom");
        expect(categories).toContain("fountain");
        expect(categories).toContain("stairs");
        expect(categories).toContain("elevator");
      }
    });

    it("all entries have buildingCode MB", () => {
      mbPois.forEach((poi) => expect(poi.buildingCode).toBe("MB"));
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
