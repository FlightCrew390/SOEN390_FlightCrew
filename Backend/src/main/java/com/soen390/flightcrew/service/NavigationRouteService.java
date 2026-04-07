package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.CoordinateDTO;
import com.soen390.flightcrew.model.DirectionsResponse;
import com.soen390.flightcrew.model.NavigationRouteDTO;
import com.soen390.flightcrew.model.NavigationStepDTO;
import com.soen390.flightcrew.model.NavigationTransitStepDetailsDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class NavigationRouteService {

    private final GoogleMapsService googleMapsService;

    public NavigationRouteService(GoogleMapsService googleMapsService) {
        this.googleMapsService = googleMapsService;
    }

    public NavigationRouteDTO getParsedRoute(Double originLat, Double originLng,
            Double destLat, Double destLng,
            String travelMode, String departureTime, String arrivalTime) {

        DirectionsResponse response = googleMapsService.getDirections(
                originLat, originLng, destLat, destLng, travelMode, departureTime, arrivalTime);

        if (response == null || response.getRoutes() == null || response.getRoutes().isEmpty()) {
            return null;
        }

        DirectionsResponse.Route route = response.getRoutes().get(0);
        List<CoordinateDTO> routeCoordinates = decodePolyline(
                route.getPolyline() != null ? route.getPolyline().getEncodedPolyline() : null);

        List<NavigationStepDTO> parsedSteps = new ArrayList<>();
        if (route.getLegs() != null) {
            for (DirectionsResponse.Leg leg : route.getLegs()) {
                if (leg.getSteps() == null) {
                    continue;
                }
                for (DirectionsResponse.Step step : leg.getSteps()) {
                    parsedSteps.add(parseStep(step));
                }
            }
        }

        return new NavigationRouteDTO(
                routeCoordinates,
                route.getDistanceMeters() != null ? route.getDistanceMeters() : 0,
                parseDuration(route.getDuration()),
                parsedSteps);
    }

    private NavigationStepDTO parseStep(DirectionsResponse.Step step) {
        NavigationTransitStepDetailsDTO transitDetails = parseTransitDetails(step.getTransitDetails());

        return new NavigationStepDTO(
                step.getDistanceMeters() != null ? step.getDistanceMeters() : 0,
                parseDuration(step.getStaticDuration()),
                step.getNavigationInstruction() != null ? step.getNavigationInstruction().getInstructions() : "",
                step.getNavigationInstruction() != null ? step.getNavigationInstruction().getManeuver() : "",
                decodePolyline(step.getPolyline() != null ? step.getPolyline().getEncodedPolyline() : null),
                transitDetails);
    }

    private NavigationTransitStepDetailsDTO parseTransitDetails(DirectionsResponse.TransitDetails td) {
        if (td == null) {
            return null;
        }
        return new NavigationTransitStepDetailsDTO(
                getDepartureStopName(td.getStopDetails()),
                getArrivalStopName(td.getStopDetails()),
                td.getStopDetails() != null ? td.getStopDetails().getDepartureTime() : "",
                td.getStopDetails() != null ? td.getStopDetails().getArrivalTime() : "",
                td.getTransitLine() != null ? td.getTransitLine().getName() : "",
                td.getTransitLine() != null ? td.getTransitLine().getNameShort() : "",
                getVehicleType(td.getTransitLine()),
                getVehicleName(td.getTransitLine()),
                td.getStopCount() != null ? td.getStopCount() : 0);
    }

    private String getDepartureStopName(DirectionsResponse.StopDetails details) {
        if (details != null && details.getDepartureStop() != null) {
            return details.getDepartureStop().getName();
        }
        return "";
    }

    private String getArrivalStopName(DirectionsResponse.StopDetails details) {
        if (details != null && details.getArrivalStop() != null) {
            return details.getArrivalStop().getName();
        }
        return "";
    }

    private String getVehicleType(DirectionsResponse.TransitLine line) {
        if (line != null && line.getVehicle() != null) {
            return line.getVehicle().getType();
        }
        return "";
    }

    private String getVehicleName(DirectionsResponse.TransitLine line) {
        if (line != null && line.getVehicle() != null && line.getVehicle().getName() != null) {
            return line.getVehicle().getName().getText();
        }
        return "";
    }

    private int parseDuration(String rawDuration) {
        if (rawDuration == null || rawDuration.isBlank()) {
            return 0;
        }
        try {
            return (int) Math.round(Double.parseDouble(rawDuration.replace("s", "")));
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    // Standard Google encoded polyline decoder.
    private List<CoordinateDTO> decodePolyline(String encoded) {
        if (encoded == null || encoded.isBlank()) {
            return Collections.emptyList();
        }

        List<CoordinateDTO> points = new ArrayList<>();
        int index = 0;
        int latitude = 0;
        int longitude = 0;

        while (index < encoded.length()) {
            int[] latResult = decodeChunk(encoded, index);
            int dLat = latResult[0];
            index = latResult[1];

            int[] lngResult = decodeChunk(encoded, index);
            int dLng = lngResult[0];
            index = lngResult[1];

            latitude += dLat;
            longitude += dLng;

            points.add(new CoordinateDTO(latitude / 1E5, longitude / 1E5));
        }

        return points;
    }

    private int[] decodeChunk(String encoded, int startIndex) {
        int result = 0;
        int shift = 0;
        int b;
        int index = startIndex;

        do {
            b = encoded.charAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        int delta = ((result & 1) != 0) ? ~(result >> 1) : (result >> 1);
        return new int[] { delta, index };
    }
}
