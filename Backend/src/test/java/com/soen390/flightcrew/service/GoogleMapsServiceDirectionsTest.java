package com.soen390.flightcrew.service;

import com.soen390.flightcrew.exception.ApiQuotaExceededException;
import com.soen390.flightcrew.model.DirectionsResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleMapsServiceDirectionsTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ApiQuotaService quotaService;

    private GoogleMapsService googleMapsService;

    // Test coordinates: SGW campus → Loyola campus
    private static final Double ORIGIN_LAT = 45.4953;
    private static final Double ORIGIN_LNG = -73.5789;
    private static final Double DEST_LAT = 45.4582;
    private static final Double DEST_LNG = -73.6405;

    @BeforeEach
    void setUp() {
        googleMapsService = new GoogleMapsService(restTemplate, quotaService);
        ReflectionTestUtils.setField(googleMapsService, "googleApiKey", "fake-test-key");
    }

    // ── Successful directions call ───────────────────────────────────

    @Test
    @DisplayName("Returns directions when API responds successfully")
    void getDirections_success_returnsResponse() {
        when(quotaService.tryConsume()).thenReturn(true);

        DirectionsResponse mockResponse = buildMockDirectionsResponse();
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(DirectionsResponse.class)))
                .thenReturn(ResponseEntity.ok(mockResponse));

        DirectionsResponse result = googleMapsService.getDirections(
                ORIGIN_LAT, ORIGIN_LNG, DEST_LAT, DEST_LNG, "WALK");

        assertNotNull(result);
        assertNotNull(result.getRoutes());
        assertEquals(1, result.getRoutes().size());
        assertEquals(5200, result.getRoutes().get(0).getDistanceMeters());
    }

    @Test
    @DisplayName("Sends request to the correct Google Routes API URL")
    void getDirections_usesCorrectUrl() {
        when(quotaService.tryConsume()).thenReturn(true);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(DirectionsResponse.class)))
                .thenReturn(ResponseEntity.ok(new DirectionsResponse()));

        googleMapsService.getDirections(ORIGIN_LAT, ORIGIN_LNG, DEST_LAT, DEST_LNG, "DRIVE");

        verify(restTemplate).postForEntity(
                eq("https://routes.googleapis.com/directions/v2:computeRoutes"),
                any(HttpEntity.class),
                eq(DirectionsResponse.class));
    }

    @Test
    @DisplayName("Consumes one unit of quota per call")
    void getDirections_consumesQuota() {
        when(quotaService.tryConsume()).thenReturn(true);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(DirectionsResponse.class)))
                .thenReturn(ResponseEntity.ok(new DirectionsResponse()));

        googleMapsService.getDirections(ORIGIN_LAT, ORIGIN_LNG, DEST_LAT, DEST_LNG, "WALK");

        verify(quotaService, times(1)).tryConsume();
    }

    // ── Travel mode handling ─────────────────────────────────────────

    @Test
    @DisplayName("Defaults to WALK when travelMode is null")
    void getDirections_nullTravelMode_defaultsToWalk() {
        when(quotaService.tryConsume()).thenReturn(true);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(DirectionsResponse.class)))
                .thenReturn(ResponseEntity.ok(new DirectionsResponse()));

        // Should not throw — null travelMode is handled internally
        DirectionsResponse result = googleMapsService.getDirections(
                ORIGIN_LAT, ORIGIN_LNG, DEST_LAT, DEST_LNG, null);

        assertNotNull(result);
        verify(restTemplate).postForEntity(anyString(), any(HttpEntity.class), eq(DirectionsResponse.class));
    }

    // ── Null coordinate handling ─────────────────────────────────────

    @Test
    @DisplayName("Returns null when origin latitude is null")
    void getDirections_nullOriginLat_returnsNull() {
        DirectionsResponse result = googleMapsService.getDirections(
                null, ORIGIN_LNG, DEST_LAT, DEST_LNG, "WALK");

        assertNull(result);
        verifyNoInteractions(restTemplate);
        verifyNoInteractions(quotaService);
    }

    @Test
    @DisplayName("Returns null when origin longitude is null")
    void getDirections_nullOriginLng_returnsNull() {
        DirectionsResponse result = googleMapsService.getDirections(
                ORIGIN_LAT, null, DEST_LAT, DEST_LNG, "WALK");

        assertNull(result);
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Returns null when destination latitude is null")
    void getDirections_nullDestLat_returnsNull() {
        DirectionsResponse result = googleMapsService.getDirections(
                ORIGIN_LAT, ORIGIN_LNG, null, DEST_LNG, "WALK");

        assertNull(result);
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Returns null when destination longitude is null")
    void getDirections_nullDestLng_returnsNull() {
        DirectionsResponse result = googleMapsService.getDirections(
                ORIGIN_LAT, ORIGIN_LNG, DEST_LAT, null, "WALK");

        assertNull(result);
        verifyNoInteractions(restTemplate);
    }

    // ── Quota exceeded ───────────────────────────────────────────────

    @Test
    @DisplayName("Throws ApiQuotaExceededException when quota is exhausted")
    void getDirections_quotaExhausted_throwsException() {
        when(quotaService.tryConsume()).thenReturn(false);

        assertThrows(ApiQuotaExceededException.class,
                () -> googleMapsService.getDirections(ORIGIN_LAT, ORIGIN_LNG, DEST_LAT, DEST_LNG, "WALK"));

        // Must NOT call Google when quota is exceeded
        verifyNoInteractions(restTemplate);
    }

    @Test
    @DisplayName("Does not call Google API when quota is exhausted")
    void getDirections_quotaExhausted_doesNotCallGoogle() {
        when(quotaService.tryConsume()).thenReturn(false);

        try {
            googleMapsService.getDirections(ORIGIN_LAT, ORIGIN_LNG, DEST_LAT, DEST_LNG, "WALK");
        } catch (ApiQuotaExceededException ignored) {
            // expected
        }

        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    // ── Google API error handling ────────────────────────────────────

    @Test
    @DisplayName("Returns null when Google API throws an exception")
    void getDirections_googleApiError_returnsNull() {
        when(quotaService.tryConsume()).thenReturn(true);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(DirectionsResponse.class)))
                .thenThrow(new RestClientException("Connection refused"));

        DirectionsResponse result = googleMapsService.getDirections(
                ORIGIN_LAT, ORIGIN_LNG, DEST_LAT, DEST_LNG, "WALK");

        assertNull(result);
    }

    @Test
    @DisplayName("Returns null when Google API returns empty body")
    void getDirections_emptyResponseBody_returnsNull() {
        when(quotaService.tryConsume()).thenReturn(true);
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(DirectionsResponse.class)))
                .thenReturn(ResponseEntity.ok(null));

        DirectionsResponse result = googleMapsService.getDirections(
                ORIGIN_LAT, ORIGIN_LNG, DEST_LAT, DEST_LNG, "WALK");

        assertNull(result);
    }

    // ── Helper ───────────────────────────────────────────────────────

    private DirectionsResponse buildMockDirectionsResponse() {
        DirectionsResponse.NavigationInstruction nav = new DirectionsResponse.NavigationInstruction();
        nav.setManeuver("TURN_LEFT");
        nav.setInstructions("Turn left onto Rue Sherbrooke");

        DirectionsResponse.Polyline stepPolyline = new DirectionsResponse.Polyline();
        stepPolyline.setEncodedPolyline("abc123");

        DirectionsResponse.Step step = new DirectionsResponse.Step();
        step.setDistanceMeters(200);
        step.setStaticDuration("180s");
        step.setPolyline(stepPolyline);
        step.setNavigationInstruction(nav);

        DirectionsResponse.Leg leg = new DirectionsResponse.Leg();
        leg.setDistanceMeters(5200);
        leg.setDuration("3900s");
        leg.setSteps(List.of(step));

        DirectionsResponse.Polyline routePolyline = new DirectionsResponse.Polyline();
        routePolyline.setEncodedPolyline("fullRouteEncodedString");

        DirectionsResponse.Route route = new DirectionsResponse.Route();
        route.setDistanceMeters(5200);
        route.setDuration("3900s");
        route.setPolyline(routePolyline);
        route.setLegs(List.of(leg));

        DirectionsResponse response = new DirectionsResponse();
        response.setRoutes(List.of(route));
        return response;
    }
}
