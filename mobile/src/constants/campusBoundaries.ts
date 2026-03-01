type Coordinate = {
  latitude: number;
  longitude: number;
};

type CampusBoundary = {
  northEast: Coordinate;
  southWest: Coordinate;
};

const campusBoundary: CampusBoundary = {
  northEast: { latitude: 45.7358, longitude: -73.3579 },
  southWest: { latitude: 45.3786, longitude: -74.0477 },
};

export { campusBoundary, CampusBoundary, Coordinate };
