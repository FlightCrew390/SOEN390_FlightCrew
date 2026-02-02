type Coordinate = {
  latitude: number;
  longitude: number;
};

type CampusBoundary = {
  northEast: Coordinate;
  southWest: Coordinate;
};

const campusBoundary: CampusBoundary = {
  northEast: { latitude: 45.5049, longitude: -73.5612 },
  southWest: { latitude: 45.4510, longitude: -73.6530 },
};

export { campusBoundary, CampusBoundary, Coordinate };
