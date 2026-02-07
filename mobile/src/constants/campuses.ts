import { Campus } from "../types/campus";

export type CampusId = "SGW" | "LOYOLA";

export const CAMPUSES: Record<CampusId, Campus> = {
  LOYOLA: {
    id: "LOY",
    name: "Loyola Campus",
    shortName: "LOY",
    location: {
      latitude: 45.4582,
      longitude: -73.6405,
    },
  },
  SGW: {
    id: "SGW",
    name: "SGW Campus",
    shortName: "SGW",
    location: {
      latitude: 45.4953,
      longitude: -73.5789,
    },
  },
};
