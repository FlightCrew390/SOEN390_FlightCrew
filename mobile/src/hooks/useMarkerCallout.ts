import { useEffect, useRef } from "react";
import { MapMarker } from "react-native-maps";

export interface UseMarkerCalloutOptions {
  /** When true the callout is auto-shown after a short delay. */
  showCallout: boolean;
  /** When true a previously visible callout is hidden. */
  hideCallout: boolean;
  /**
   * Extra dependencies that should re-trigger the show logic
   * (e.g. a POI object changing).
   */
  deps?: React.DependencyList;
}

/**
 * Shared hook that manages show / hide of a native map-marker callout.
 *
 * Returns a ref to attach to the `<Marker>` component.
 */
export default function useMarkerCallout({
  showCallout,
  hideCallout,
  deps = [],
}: UseMarkerCalloutOptions) {
  const markerRef = useRef<MapMarker>(null);

  // Show callout with a short delay so the marker has time to layout
  useEffect(() => {
    if (showCallout && markerRef.current) {
      const timer = setTimeout(() => {
        markerRef.current?.showCallout();
      }, 900);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCallout, ...deps]);

  // Immediately hide callout (e.g. when directions panel opens)
  useEffect(() => {
    if (hideCallout && markerRef.current) {
      markerRef.current.hideCallout();
    }
  }, [hideCallout]);

  return markerRef;
}
