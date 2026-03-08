import { useEffect, useRef, useState } from "react";
import { DirectionsService } from "../services/DirectionsService";
import { ShuttleDirectionsBuilder } from "../services/ShuttleDirectionsBuilder";
import { Building } from "../types/Building";
import {
    DepartureTimeConfig,
    TravelMode,
} from "../types/Directions";

const PREVIEW_MODES: TravelMode[] = ["WALK", "BICYCLE", "TRANSIT", "DRIVE", "SHUTTLE"];

export type RoutePreviews = Partial<Record<TravelMode, number | null>>;

interface UseRoutePreviewsParams {
    destination: Building | null;
    startBuilding: Building | null;
    userLocation: { latitude: number; longitude: number } | null;
    departureConfig: DepartureTimeConfig;
    active: boolean;
}

/**
 * Fetches route duration previews for ALL transport modes in parallel
 * whenever the directions panel is active and origin/destination are known.
 * Returns a map of TravelMode → durationSeconds (null = failed/loading).
 */
export function useRoutePreviews({
    destination,
    startBuilding,
    userLocation,
    departureConfig,
    active,
}: UseRoutePreviewsParams): RoutePreviews {
    const [previews, setPreviews] = useState<RoutePreviews>({});

    useEffect(() => {
        if (!active || !destination) {
            setPreviews({});
            return;
        }

        const originLat = startBuilding?.latitude ?? userLocation?.latitude;
        const originLng = startBuilding?.longitude ?? userLocation?.longitude;

        if (originLat == null || originLng == null) return;

        let cancelled = false;

        const departureTime =
            departureConfig.option === "depart_at"
                ? departureConfig.date.toISOString()
                : undefined;
        const arrivalTime =
            departureConfig.option === "arrive_by"
                ? departureConfig.date.toISOString()
                : undefined;

        const fetchAll = async () => {
            const promises = PREVIEW_MODES.map(async (mode) => {
                try {
                    let route;
                    if (mode === "SHUTTLE") {
                        route = await ShuttleDirectionsBuilder.buildShuttleRoute(
                            originLat,
                            originLng,
                            destination.latitude,
                            destination.longitude,
                            departureConfig,
                            startBuilding,
                            destination,
                        );
                    } else {
                        // DRIVE mode does not support future departure/arrival
                        // times in the Google Routes API, so omit them.
                        const modeDepartureTime =
                            mode === "DRIVE" ? undefined : departureTime;
                        const modeArrivalTime =
                            mode === "DRIVE" ? undefined : arrivalTime;
                        route = await DirectionsService.fetchDirections(
                            originLat,
                            originLng,
                            destination.latitude,
                            destination.longitude,
                            mode,
                            modeDepartureTime,
                            modeArrivalTime,
                        );
                    }
                    return { mode, duration: route?.durationSeconds ?? null };
                } catch {
                    return { mode, duration: null };
                }
            });

            const results = await Promise.all(promises);

            if (!cancelled) {
                const newPreviews: RoutePreviews = {};
                for (const { mode, duration } of results) {
                    newPreviews[mode] = duration;
                }
                setPreviews(newPreviews);
            }
        };

        fetchAll();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        active,
        destination?.buildingCode,
        startBuilding?.buildingCode,
        userLocation?.latitude,
        userLocation?.longitude,
        departureConfig.option,
        departureConfig.date,
    ]);

    return previews;
}
