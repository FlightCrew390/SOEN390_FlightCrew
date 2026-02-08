jest.mock("../../src/types/campus", () => ({}));

import { CAMPUSES, CampusId } from "../../src/constants/campuses";

describe("campuses", () => {
    it("should export CAMPUSES with SGW and LOYOLA", () => {
        expect(CAMPUSES).toHaveProperty("SGW");
        expect(CAMPUSES).toHaveProperty("LOYOLA");
    });

    it("should have valid SGW campus structure", () => {
        expect(CAMPUSES.SGW).toEqual({
            id: "SGW",
            name: "SGW Campus",
            shortName: "SGW",
            location: {
                latitude: 45.4953,
                longitude: -73.5789,
            },
        });
    });

    it("should have valid LOYOLA campus structure", () => {
        expect(CAMPUSES.LOYOLA).toEqual({
            id: "LOY",
            name: "Loyola Campus",
            shortName: "LOY",
            location: {
                latitude: 45.4582,
                longitude: -73.6405,
            },
        });
    });
});
