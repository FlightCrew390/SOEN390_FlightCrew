export const SHUTTLE_STOPS = {
  SGW: {
    name: "Concordia Shuttle Bus Stop",
    coordinate: { latitude: 45.497168, longitude: -73.578428 },
    address: "1455 Blvd. De Maisonneuve Ouest, Montreal, Quebec H3G 1M8",
  },
  LOY: {
    name: "Loyola Shuttle Bus Stop",
    coordinate: { latitude: 45.458439, longitude: -73.638257 },
    address: "7141 Sherbrooke St W, Montreal, QC H4B 1R6",
  },
} as const;

/** Approximate one-way shuttle ride time in minutes */
export const SHUTTLE_RIDE_MINUTES = 30;
