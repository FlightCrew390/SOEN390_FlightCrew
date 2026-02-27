package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.exception.ApiQuotaExceededException;
import com.soen390.flightcrew.exception.GlobalExceptionHandler;
import com.soen390.flightcrew.model.DirectionsResponse;
import com.soen390.flightcrew.service.ApiQuotaService;
import com.soen390.flightcrew.service.GoogleMapsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DirectionsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private GoogleMapsService googleMapsService;

    @Mock
    private ApiQuotaService quotaService;

    @InjectMocks
    private DirectionsController directionsController;

    private static final String DIRECTIONS_URL = "/api/directions";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(directionsController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ── Successful responses ─────────────────────────────────────────

    @Test
    @DisplayName("GET /api/directions — 200 with valid route")
    void getDirections_validRequest_returns200() throws Exception {
        DirectionsResponse mockResponse = buildMockResponse(5200, "3900s");
        when(googleMapsService.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString()))
                .thenReturn(mockResponse);

        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLat", "45.4953")
                .param("originLng", "-73.5789")
                .param("destLat", "45.4582")
                .param("destLng", "-73.6405")
                .param("travelMode", "WALK"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routes").isArray())
                .andExpect(jsonPath("$.routes[0].distanceMeters").value(5200))
                .andExpect(jsonPath("$.routes[0].duration").value("3900s"));
    }

    @Test
    @DisplayName("GET /api/directions — defaults travelMode to WALK when omitted")
    void getDirections_noTravelMode_defaultsToWalk() throws Exception {
        DirectionsResponse mockResponse = buildMockResponse(1000, "600s");
        when(googleMapsService.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble(), eq("WALK")))
                .thenReturn(mockResponse);

        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLat", "45.4953")
                .param("originLng", "-73.5789")
                .param("destLat", "45.4582")
                .param("destLng", "-73.6405"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routes").isArray());
    }

    @Test
    @DisplayName("GET /api/directions — response includes turn-by-turn steps")
    void getDirections_responseIncludesSteps() throws Exception {
        DirectionsResponse mockResponse = buildMockResponseWithSteps();
        when(googleMapsService.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString()))
                .thenReturn(mockResponse);

        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLat", "45.4953")
                .param("originLng", "-73.5789")
                .param("destLat", "45.4582")
                .param("destLng", "-73.6405")
                .param("travelMode", "DRIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routes[0].legs[0].steps").isArray())
                .andExpect(jsonPath("$.routes[0].legs[0].steps[0].navigationInstruction.instructions")
                        .value("Head north on Rue Guy"))
                .andExpect(jsonPath("$.routes[0].legs[0].steps[1].navigationInstruction.maneuver")
                        .value("TURN_RIGHT"));
    }

    @Test
    @DisplayName("GET /api/directions — response includes encoded polyline")
    void getDirections_responseIncludesPolyline() throws Exception {
        DirectionsResponse mockResponse = buildMockResponse(3000, "2400s");
        when(googleMapsService.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString()))
                .thenReturn(mockResponse);

        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLat", "45.4953")
                .param("originLng", "-73.5789")
                .param("destLat", "45.4582")
                .param("destLng", "-73.6405")
                .param("travelMode", "WALK"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routes[0].polyline.encodedPolyline").value("encodedPolylineString"));
    }

    // ── No content responses ─────────────────────────────────────────

    @Test
    @DisplayName("GET /api/directions — 204 when service returns null")
    void getDirections_serviceReturnsNull_returns204() throws Exception {
        when(googleMapsService.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString()))
                .thenReturn(null);

        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLat", "45.4953")
                .param("originLng", "-73.5789")
                .param("destLat", "45.4582")
                .param("destLng", "-73.6405")
                .param("travelMode", "WALK"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/directions — 204 when routes list is empty")
    void getDirections_emptyRoutes_returns204() throws Exception {
        DirectionsResponse emptyResponse = new DirectionsResponse();
        emptyResponse.setRoutes(Collections.emptyList());
        when(googleMapsService.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString()))
                .thenReturn(emptyResponse);

        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLat", "45.4953")
                .param("originLng", "-73.5789")
                .param("destLat", "45.4582")
                .param("destLng", "-73.6405")
                .param("travelMode", "WALK"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/directions — 204 when routes is null in response object")
    void getDirections_nullRoutes_returns204() throws Exception {
        DirectionsResponse noRoutes = new DirectionsResponse();
        noRoutes.setRoutes(null);
        when(googleMapsService.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString()))
                .thenReturn(noRoutes);

        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLat", "45.4953")
                .param("originLng", "-73.5789")
                .param("destLat", "45.4582")
                .param("destLng", "-73.6405")
                .param("travelMode", "WALK"))
                .andExpect(status().isNoContent());
    }

    // ── Quota exceeded ───────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/directions — 429 when API quota is exceeded")
    void getDirections_quotaExceeded_returns429() throws Exception {
        when(googleMapsService.getDirections(anyDouble(), anyDouble(), anyDouble(), anyDouble(), anyString()))
                .thenThrow(new ApiQuotaExceededException("Google API quota exceeded. Try again later."));

        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLat", "45.4953")
                .param("originLng", "-73.5789")
                .param("destLat", "45.4582")
                .param("destLng", "-73.6405")
                .param("travelMode", "WALK"))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("rate_limit_exceeded"))
                .andExpect(jsonPath("$.message").exists());
    }

    // ── Missing required parameters ──────────────────────────────────

    @Test
    @DisplayName("GET /api/directions — 400 when originLat is missing")
    void getDirections_missingOriginLat_returns400() throws Exception {
        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLng", "-73.5789")
                .param("destLat", "45.4582")
                .param("destLng", "-73.6405"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/directions — 400 when destLat is missing")
    void getDirections_missingDestLat_returns400() throws Exception {
        mockMvc.perform(get(DIRECTIONS_URL)
                .param("originLat", "45.4953")
                .param("originLng", "-73.5789")
                .param("destLng", "-73.6405"))
                .andExpect(status().isBadRequest());
    }

    // ── Quota status endpoint ────────────────────────────────────────

    @Test
    @DisplayName("GET /api/quota/status — returns usage info")
    void getQuotaStatus_returnsUsageInfo() throws Exception {
        when(quotaService.getMonthlyUsage()).thenReturn(42);
        when(quotaService.getMonthlyLimit()).thenReturn(9000);
        when(quotaService.getRemainingMonthlyQuota()).thenReturn(8958);

        mockMvc.perform(get("/api/quota/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.monthlyUsage").value(42))
                .andExpect(jsonPath("$.monthlyLimit").value(9000))
                .andExpect(jsonPath("$.remaining").value(8958));
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private DirectionsResponse buildMockResponse(int distanceMeters, String duration) {
        DirectionsResponse.Polyline polyline = new DirectionsResponse.Polyline();
        polyline.setEncodedPolyline("encodedPolylineString");

        DirectionsResponse.Route route = new DirectionsResponse.Route();
        route.setDistanceMeters(distanceMeters);
        route.setDuration(duration);
        route.setPolyline(polyline);
        route.setLegs(Collections.emptyList());

        DirectionsResponse response = new DirectionsResponse();
        response.setRoutes(List.of(route));
        return response;
    }

    private DirectionsResponse buildMockResponseWithSteps() {
        DirectionsResponse.NavigationInstruction nav1 = new DirectionsResponse.NavigationInstruction();
        nav1.setManeuver("DEPART");
        nav1.setInstructions("Head north on Rue Guy");

        DirectionsResponse.Polyline stepPoly1 = new DirectionsResponse.Polyline();
        stepPoly1.setEncodedPolyline("step1poly");

        DirectionsResponse.Step step1 = new DirectionsResponse.Step();
        step1.setDistanceMeters(150);
        step1.setStaticDuration("120s");
        step1.setPolyline(stepPoly1);
        step1.setNavigationInstruction(nav1);

        DirectionsResponse.NavigationInstruction nav2 = new DirectionsResponse.NavigationInstruction();
        nav2.setManeuver("TURN_RIGHT");
        nav2.setInstructions("Turn right onto Boulevard De Maisonneuve");

        DirectionsResponse.Polyline stepPoly2 = new DirectionsResponse.Polyline();
        stepPoly2.setEncodedPolyline("step2poly");

        DirectionsResponse.Step step2 = new DirectionsResponse.Step();
        step2.setDistanceMeters(300);
        step2.setStaticDuration("240s");
        step2.setPolyline(stepPoly2);
        step2.setNavigationInstruction(nav2);

        DirectionsResponse.Leg leg = new DirectionsResponse.Leg();
        leg.setDistanceMeters(450);
        leg.setDuration("360s");
        leg.setSteps(List.of(step1, step2));

        DirectionsResponse.Polyline routePoly = new DirectionsResponse.Polyline();
        routePoly.setEncodedPolyline("fullRoutePoly");

        DirectionsResponse.Route route = new DirectionsResponse.Route();
        route.setDistanceMeters(450);
        route.setDuration("360s");
        route.setPolyline(routePoly);
        route.setLegs(List.of(leg));

        DirectionsResponse response = new DirectionsResponse();
        response.setRoutes(List.of(route));
        return response;
    }
}
