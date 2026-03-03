package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.exception.GlobalExceptionHandler;
import com.soen390.flightcrew.model.CoordinateDTO;
import com.soen390.flightcrew.model.ShuttleRouteResponse;
import com.soen390.flightcrew.model.ShuttleScheduleResponse;
import com.soen390.flightcrew.model.ShuttleTimeDTO;
import com.soen390.flightcrew.service.ShuttleScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ShuttleControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ShuttleScheduleService shuttleScheduleService;

    @InjectMocks
    private ShuttleController shuttleController;

    private static final String SCHEDULE_URL = "/api/shuttle/schedule";
    private static final String ROUTE_URL = "/api/shuttle/route";

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(shuttleController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ── Schedule endpoint ────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/shuttle/schedule — defaults to today when no day param")
    void getSchedule_noParam_defaultsToToday() throws Exception {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        ShuttleScheduleResponse mockResponse = buildScheduleResponse(today.name(), false);
        when(shuttleScheduleService.getSchedule(today)).thenReturn(mockResponse);

        mockMvc.perform(get(SCHEDULE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.day").value(today.name()))
                .andExpect(jsonPath("$.no_service").value(false));

        verify(shuttleScheduleService).getSchedule(today);
    }

    @Test
    @DisplayName("GET /api/shuttle/schedule?day=FRIDAY — returns Friday schedule")
    void getSchedule_friday_returnsFridaySchedule() throws Exception {
        ShuttleScheduleResponse mockResponse = buildScheduleResponse("FRIDAY", false);
        when(shuttleScheduleService.getSchedule(DayOfWeek.FRIDAY)).thenReturn(mockResponse);

        mockMvc.perform(get(SCHEDULE_URL).param("day", "FRIDAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.day").value("FRIDAY"))
                .andExpect(jsonPath("$.departures").isArray());

        verify(shuttleScheduleService).getSchedule(DayOfWeek.FRIDAY);
    }

    @Test
    @DisplayName("GET /api/shuttle/schedule?day=friday — case-insensitive")
    void getSchedule_lowercaseDay_accepted() throws Exception {
        ShuttleScheduleResponse mockResponse = buildScheduleResponse("FRIDAY", false);
        when(shuttleScheduleService.getSchedule(DayOfWeek.FRIDAY)).thenReturn(mockResponse);

        mockMvc.perform(get(SCHEDULE_URL).param("day", "friday"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.day").value("FRIDAY"));
    }

    @Test
    @DisplayName("GET /api/shuttle/schedule?day=SUNDAY — returns noService")
    void getSchedule_sunday_returnsNoService() throws Exception {
        ShuttleScheduleResponse weekendResponse = new ShuttleScheduleResponse(
                "SUNDAY", true, null, null, Collections.emptyList());
        when(shuttleScheduleService.getSchedule(DayOfWeek.SUNDAY)).thenReturn(weekendResponse);

        mockMvc.perform(get(SCHEDULE_URL).param("day", "SUNDAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.no_service").value(true))
                .andExpect(jsonPath("$.departures").isEmpty());
    }

    @Test
    @DisplayName("GET /api/shuttle/schedule?day=INVALID — returns 400")
    void getSchedule_invalidDay_returns400() throws Exception {
        mockMvc.perform(get(SCHEDULE_URL).param("day", "BANANA"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("invalid_day"));

        verify(shuttleScheduleService, never()).getSchedule(any());
    }

    @Test
    @DisplayName("GET /api/shuttle/schedule — response includes service window")
    void getSchedule_includesServiceWindow() throws Exception {
        ShuttleScheduleResponse mockResponse = buildScheduleResponse("MONDAY", false);
        when(shuttleScheduleService.getSchedule(DayOfWeek.MONDAY)).thenReturn(mockResponse);

        mockMvc.perform(get(SCHEDULE_URL).param("day", "MONDAY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service_start").value("09:15"))
                .andExpect(jsonPath("$.service_end").value("18:30"));
    }

    // ── Route endpoint ───────────────────────────────────────────────

    @Test
    @DisplayName("GET /api/shuttle/route — returns 200 with route data")
    void getRoute_returns200() throws Exception {
        ShuttleRouteResponse mockRoute = buildRouteResponse();
        when(shuttleScheduleService.getRoute()).thenReturn(mockRoute);

        mockMvc.perform(get(ROUTE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.duration").value("21 mins"))
                .andExpect(jsonPath("$.distance").value("8.3 km"))
                .andExpect(jsonPath("$.sgw_to_loyola").isArray())
                .andExpect(jsonPath("$.loyola_to_sgw").isArray());
    }

    @Test
    @DisplayName("GET /api/shuttle/route — coordinates have lat/lng fields")
    void getRoute_coordinatesHaveLatLng() throws Exception {
        ShuttleRouteResponse mockRoute = buildRouteResponse();
        when(shuttleScheduleService.getRoute()).thenReturn(mockRoute);

        mockMvc.perform(get(ROUTE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sgw_to_loyola[0].latitude").value(45.497))
                .andExpect(jsonPath("$.sgw_to_loyola[0].longitude").value(-73.579));
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private ShuttleScheduleResponse buildScheduleResponse(String day, boolean noService) {
        List<ShuttleTimeDTO> departures = noService
                ? Collections.emptyList()
                : List.of(
                        new ShuttleTimeDTO("09:15", "09:30", false),
                        new ShuttleTimeDTO("18:15", "18:30", true),
                        new ShuttleTimeDTO("18:30", null, true));

        return new ShuttleScheduleResponse(
                day, noService, noService ? null : "09:15", noService ? null : "18:30", departures);
    }

    private ShuttleRouteResponse buildRouteResponse() {
        List<CoordinateDTO> sgwToLoyola = List.of(
                new CoordinateDTO(45.497, -73.579),
                new CoordinateDTO(45.459, -73.639));
        List<CoordinateDTO> loyolaToSgw = List.of(
                new CoordinateDTO(45.459, -73.639),
                new CoordinateDTO(45.497, -73.579));

        return new ShuttleRouteResponse("21 mins", "8.3 km", sgwToLoyola, loyolaToSgw);
    }
}
