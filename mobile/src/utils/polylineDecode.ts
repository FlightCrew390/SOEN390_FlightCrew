/**
 * Decodes a Google Maps encoded polyline string into an array of coordinates.
 * Algorithm: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 */
export function decodePolyline(
  encoded: string,
): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    // Decode latitude
    do {
      byte = (encoded.codePointAt(index++) ?? 0) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = (encoded.codePointAt(index++) ?? 0) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}
