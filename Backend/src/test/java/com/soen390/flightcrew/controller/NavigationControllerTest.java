package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.exception.GlobalExceptionHandler;
import com.soen390.flightcrew.model.CoordinateDTO;
import com.soen390.flightcrew.model.NavigationRouteDTO;
import com.soen390.flightcrew.model.NavigationStepDTO;
import com.soen390.flightcrew.service.NavigationRouteService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NavigationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private NavigationRouteService navigationRouteService;

    @InjectMocks
    private NavigationController navigationController;

    private static final String ROUTE_URL = "/api/navigation/route";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(navigationController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/navigation/route returns parsed route")
    void getParsedRoute_validRequest_returns200() throws Exception {
        NavigationRouteDTO route = buildRoute(1200, 601);
        when(navigationRouteService.getParsedRoute(45.0, -73.0, 45.5, -73.5, "TRANSIT", "1000", null))
                .thenReturn(route);

        mockMvc.perform(get(ROUTE_URL)
                .param("originLat", "45.0")
                .param("originLng", "-73.0")
                .param("destLat", "45.5")
                .param("destLng", "-73.5")
                .param("travelMode", "TRANSIT")
                .param("departureTime", "1000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.distanceMeters").value(1200))
                .andExpect(jsonPath("$.durationSeconds").value(601))
                .andExpect(jsonPath("$.coordinates[0].latitude").value(45.0))
                .andExpect(jsonPath("$.coordinates[0].longitude").value(-73.0));

        verify(navigationRouteService).getParsedRoute(45.0, -73.0, 45.5, -73.5, "TRANSIT", "1000", null);
    }

    @Test
    @DisplayName("GET /api/navigation/route defaults travelMode to WALK")
    void getParsedRoute_noTravelMode_defaultsToWalk() throws Exception {
        NavigationRouteDTO route = buildRoute(900, 500);
        when(navigationRouteService.getParsedRoute(any(), any(), any(), any(), eq("WALK"), any(), any()))
                .thenReturn(route);

        mockMvc.perform(get(ROUTE_URL)
                .param("originLat", "45.0")
                .param("originLng", "-73.0")
                .param("destLat", "45.5")
                .param("destLng", "-73.5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.distanceMeters").value(900));

        verify(navigationRouteService).getParsedRoute(45.0, -73.0, 45.5, -73.5, "WALK", null, null);
    }

    @Test
    @DisplayName("GET /api/navigation/route returns 204 when route is null")
    void getParsedRoute_serviceReturnsNull_returns204() throws Exception {
        when(navigationRouteService.getParsedRoute(any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(null);

        mockMvc.perform(get(ROUTE_URL)
                .param("originLat", "45.0")
                .param("originLng", "-73.0")
                .param("destLat", "45.5")
                .param("destLng", "-73.5")
                .param("travelMode", "WALK"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/navigation/route returns 400 when required parameter is missing")
    void getParsedRoute_missingRequiredParam_returns400() throws Exception {
        mockMvc.perform(get(ROUTE_URL)
                .param("originLat", "45.0")
                .param("originLng", "-73.0")
                .param("destLat", "45.5"))
                .andExpect(status().isBadRequest());
    }

    private NavigationRouteDTO buildRoute(int distanceMeters, int durationSeconds) {
        List<CoordinateDTO> coordinates = List.of(
                new CoordinateDTO(45.0, -73.0),
                new CoordinateDTO(45.5, -73.5));

        List<NavigationStepDTO> steps = List.of(
                new NavigationStepDTO(350, 120, "Head west", "TURN_LEFT", coordinates, null));

        return new NavigationRouteDTO(coordinates, distanceMeters, durationSeconds, steps);
    }
}
