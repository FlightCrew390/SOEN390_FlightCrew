package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.DirectionsResponse;
import com.soen390.flightcrew.model.NavigationRouteDTO;
import com.soen390.flightcrew.model.NavigationStepDTO;
import com.soen390.flightcrew.model.NavigationTransitStepDetailsDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertNull;

@ExtendWith(MockitoExtension.class)
class NavigationRouteServiceTest {
    private static final String ENCODED_POLYLINE = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";

    @Mock
    private GoogleMapsService googleMapsService;

    private NavigationRouteService navigationRouteService;

    @BeforeEach
    void setUp() {
        navigationRouteService = new NavigationRouteService(googleMapsService);
    }

    @Test
    void testGetParsedRoute() {
        DirectionsResponse response = buildDirectionsResponse();

        when(googleMapsService.getDirections(45.0, -73.0, 45.5, -73.5, "TRANSIT", "1000", null))
                .thenReturn(response);

        NavigationRouteDTO parsedRoute = navigationRouteService.getParsedRoute(
                45.0,
                -73.0,
                45.5,
                -73.5,
                "TRANSIT",
                "1000",
                null);

        assertNotNull(parsedRoute);
        assertEquals(1200, parsedRoute.getDistanceMeters());
        assertEquals(601, parsedRoute.getDurationSeconds());
        assertEquals(3, parsedRoute.getCoordinates().size());
        assertEquals(1, parsedRoute.getSteps().size());

        NavigationStepDTO parsedStep = parsedRoute.getSteps().get(0);
        assertEquals(350, parsedStep.getDistanceMeters());
        assertEquals(120, parsedStep.getDurationSeconds());
        assertEquals("Head west", parsedStep.getInstruction());
        assertEquals("TURN_LEFT", parsedStep.getManeuver());
        assertFalse(parsedStep.getCoordinates().isEmpty());

        NavigationTransitStepDetailsDTO parsedTransitDetails = parsedStep.getTransitDetails();
        assertNotNull(parsedTransitDetails);
        assertEquals("Hall Building", parsedTransitDetails.getDepartureStopName());
        assertEquals("Loyola Campus", parsedTransitDetails.getArrivalStopName());
        assertEquals("Concordia Shuttle", parsedTransitDetails.getLineName());
        assertEquals("CS", parsedTransitDetails.getLineShortName());
        assertEquals("BUS", parsedTransitDetails.getVehicleType());
        assertEquals("Shuttle", parsedTransitDetails.getVehicleName());
        assertEquals(3, parsedTransitDetails.getStopCount());

        verify(googleMapsService).getDirections(45.0, -73.0, 45.5, -73.5, "TRANSIT", "1000", null);
    }

    @Test
    void testGetParsedRoute_NoRoutes() {
        when(googleMapsService.getDirections(45.0, -73.0, 45.5, -73.5, "DRIVING", null, null))
                .thenReturn(new DirectionsResponse());

        NavigationRouteDTO parsedRoute = navigationRouteService.getParsedRoute(
                45.0,
                -73.0,
                45.5,
                -73.5,
                "DRIVING",
                null,
                null);

        assertNull(parsedRoute);
        verify(googleMapsService).getDirections(45.0, -73.0, 45.5, -73.5, "DRIVING", null, null);
    }

    @Test
    void testGetParsedRoute_NullResponse() {
        when(googleMapsService.getDirections(45.0, -73.0, 45.5, -73.5, "WALKING", null, null))
                .thenReturn(null);

        NavigationRouteDTO parsedRoute = navigationRouteService.getParsedRoute(
                45.0,
                -73.0,
                45.5,
                -73.5,
                "WALKING",
                null,
                null);

        assertNull(parsedRoute);
        verify(googleMapsService).getDirections(45.0, -73.0, 45.5, -73.5, "WALKING", null, null);
    }

    private DirectionsResponse buildDirectionsResponse() {
        DirectionsResponse.Step step = new DirectionsResponse.Step();
        step.setDistanceMeters(350);
        step.setStaticDuration("120.4s");
        step.setNavigationInstruction(buildInstruction());
        step.setPolyline(buildPolyline(ENCODED_POLYLINE));
        step.setTransitDetails(buildTransitDetails());

        DirectionsResponse.Leg leg = new DirectionsResponse.Leg();
        leg.setSteps(List.of(step));

        DirectionsResponse.Route route = new DirectionsResponse.Route();
        route.setLegs(List.of(leg));
        route.setPolyline(buildPolyline(ENCODED_POLYLINE));
        route.setDistanceMeters(1200);
        route.setDuration("601s");

        DirectionsResponse response = new DirectionsResponse();
        response.setRoutes(List.of(route));
        return response;
    }

    private DirectionsResponse.NavigationInstruction buildInstruction() {
        DirectionsResponse.NavigationInstruction instruction = new DirectionsResponse.NavigationInstruction();
        instruction.setInstructions("Head west");
        instruction.setManeuver("TURN_LEFT");
        return instruction;
    }

    private DirectionsResponse.TransitDetails buildTransitDetails() {
        DirectionsResponse.TransitStop departureStop = new DirectionsResponse.TransitStop();
        departureStop.setName("Hall Building");

        DirectionsResponse.TransitStop arrivalStop = new DirectionsResponse.TransitStop();
        arrivalStop.setName("Loyola Campus");

        DirectionsResponse.StopDetails stopDetails = new DirectionsResponse.StopDetails();
        stopDetails.setDepartureStop(departureStop);
        stopDetails.setArrivalStop(arrivalStop);
        stopDetails.setDepartureTime("2026-03-21T12:00:00Z");
        stopDetails.setArrivalTime("2026-03-21T12:15:00Z");

        DirectionsResponse.TransitVehicleName vehicleName = new DirectionsResponse.TransitVehicleName();
        vehicleName.setText("Shuttle");

        DirectionsResponse.TransitVehicle transitVehicle = new DirectionsResponse.TransitVehicle();
        transitVehicle.setType("BUS");
        transitVehicle.setName(vehicleName);

        DirectionsResponse.TransitLine transitLine = new DirectionsResponse.TransitLine();
        transitLine.setName("Concordia Shuttle");
        transitLine.setNameShort("CS");
        transitLine.setVehicle(transitVehicle);

        DirectionsResponse.TransitDetails transitDetails = new DirectionsResponse.TransitDetails();
        transitDetails.setStopDetails(stopDetails);
        transitDetails.setTransitLine(transitLine);
        transitDetails.setStopCount(3);
        return transitDetails;
    }

    private DirectionsResponse.Polyline buildPolyline(String encoded) {
        DirectionsResponse.Polyline polyline = new DirectionsResponse.Polyline();
        polyline.setEncodedPolyline(encoded);
        return polyline;
    }
}
