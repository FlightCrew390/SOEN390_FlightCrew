import { Polyline } from "react-native-maps";
import { COLORS } from "../../constants";
import { RouteInfo, TRAVEL_MODE, TravelMode } from "../../types/Directions";

interface RoutePolylineProps {
  readonly route: RouteInfo | null;
  readonly travelMode: TravelMode | null;
}

/**
 * Renders the navigation route polyline on the map.
 */
export default function RoutePolyline({
  route,
  travelMode,
}: Readonly<RoutePolylineProps>) {
  if (!route || route.coordinates.length < 2) return null;

  return (
    <Polyline
      coordinates={route.coordinates}
      strokeColor={
        travelMode === TRAVEL_MODE.SHUTTLE
          ? COLORS.concordiaMaroon
          : COLORS.mapPolylineWalk
      }
      strokeWidth={5}
      lineDashPattern={travelMode === TRAVEL_MODE.WALK ? [8, 6] : undefined}
    />
  );
}
