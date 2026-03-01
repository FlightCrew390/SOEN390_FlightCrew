package com.soen390.flightcrew.service;

import com.soen390.flightcrew.model.DirectionsResponse;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * Single live integration test against the real Google Routes API.
 *
 * <p>
 * <b>Costs one billable request.</b> Skipped automatically unless the
 * {@code GOOGLE_API_KEY} environment variable is set, so CI never
 * triggers it accidentally.
 * </p>
 *
 * <h3>Run manually:</h3>
 * 
 * <pre>
 *   GOOGLE_API_KEY=your-key mvn test -Dgroups=live-api
 * </pre>
 *
 * <p>
 * To ensure this never runs in CI, add to your surefire/failsafe config:
 * </p>
 * 
 * <pre>{@code
 *   <excludedGroups>live-api</excludedGroups>
 * }</pre>
 */
@Tag("live-api")
class GoogleRoutesApiLiveTest {

    private static String apiKey;

    // SGW campus (Hall Building) → Loyola campus (AD Building)
    private static final double ORIGIN_LAT = 45.4972;
    private static final double ORIGIN_LNG = -73.5790;
    private static final double DEST_LAT = 45.4583;
    private static final double DEST_LNG = -73.6403;

    private static final String ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

    @BeforeAll
    static void checkApiKey() {
        apiKey = System.getenv("GOOGLE_API_KEY");
        assumeTrue(apiKey != null && !apiKey.isBlank(),
                "Skipped — set GOOGLE_API_KEY env var to run this live test");
    }

    @Test
    @DisplayName("Live API: real response deserializes into DirectionsResponse model")
    void liveRequest_deserializesCorrectly() {
        // Build request exactly as GoogleMapsService does
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", apiKey);
        headers.set("X-Goog-FieldMask",
                "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,"
                        + "routes.legs.steps.navigationInstruction,"
                        + "routes.legs.steps.polyline.encodedPolyline,"
                        + "routes.legs.steps.distanceMeters,"
                        + "routes.legs.steps.staticDuration,"
                        + "routes.legs.distanceMeters,routes.legs.duration");

        Map<String, Object> origin = Map.of(
                "location", Map.of("latLng", Map.of("latitude", ORIGIN_LAT, "longitude", ORIGIN_LNG)));
        Map<String, Object> destination = Map.of(
                "location", Map.of("latLng", Map.of("latitude", DEST_LAT, "longitude", DEST_LNG)));
        Map<String, Object> body = Map.of(
                "origin", origin,
                "destination", destination,
                "travelMode", "WALK",
                "computeAlternativeRoutes", false);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<DirectionsResponse> response = restTemplate.postForEntity(ROUTES_URL, entity,
                DirectionsResponse.class);

        // ── Status & top-level structure ──
        assertEquals(HttpStatus.OK, response.getStatusCode());
        DirectionsResponse directions = response.getBody();
        assertNotNull(directions, "Response body should not be null");
        assertNotNull(directions.getRoutes(), "Routes list should not be null");
        assertFalse(directions.getRoutes().isEmpty(), "Should have at least one route");

        // ── Route fields ──
        DirectionsResponse.Route route = directions.getRoutes().get(0);
        assertNotNull(route.getDistanceMeters(), "Route distanceMeters should be present");
        assertTrue(route.getDistanceMeters() > 0, "Distance should be positive");
        assertNotNull(route.getDuration(), "Route duration should be present");
        assertNotNull(route.getPolyline(), "Route polyline should be present");
        assertNotNull(route.getPolyline().getEncodedPolyline(),
                "Encoded polyline string should be present");
        assertFalse(route.getPolyline().getEncodedPolyline().isBlank(),
                "Encoded polyline should not be blank");

        // ── Legs ──
        assertNotNull(route.getLegs(), "Legs should be present");
        assertFalse(route.getLegs().isEmpty(), "Should have at least one leg");

        DirectionsResponse.Leg leg = route.getLegs().get(0);
        assertNotNull(leg.getDistanceMeters(), "Leg distanceMeters should be present");
        assertNotNull(leg.getDuration(), "Leg duration should be present");

        // ── Turn-by-turn steps ──
        assertNotNull(leg.getSteps(), "Steps should be present");
        assertFalse(leg.getSteps().isEmpty(), "Should have at least one step");

        DirectionsResponse.Step firstStep = leg.getSteps().get(0);
        assertNotNull(firstStep.getDistanceMeters(), "Step distanceMeters should be present");
        assertNotNull(firstStep.getPolyline(), "Step polyline should be present");
        assertNotNull(firstStep.getPolyline().getEncodedPolyline(),
                "Step encoded polyline should be present");

        // At least some steps should have navigation instructions
        long stepsWithNav = leg.getSteps().stream()
                .filter(s -> s.getNavigationInstruction() != null)
                .count();
        assertTrue(stepsWithNav > 0,
                "At least one step should have a navigation instruction");

        // Sanity: walking from SGW to Loyola is roughly 6–10 km
        assertTrue(route.getDistanceMeters() > 3000,
                "SGW→Loyola walking should be > 3 km, got " + route.getDistanceMeters());
        assertTrue(route.getDistanceMeters() < 20000,
                "SGW→Loyola walking should be < 20 km, got " + route.getDistanceMeters());
    }
}
