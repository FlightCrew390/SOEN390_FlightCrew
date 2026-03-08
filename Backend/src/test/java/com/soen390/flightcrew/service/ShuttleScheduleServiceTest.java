package com.soen390.flightcrew.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soen390.flightcrew.model.CoordinateDTO;
import com.soen390.flightcrew.model.ShuttleRouteResponse;
import com.soen390.flightcrew.model.ShuttleScheduleResponse;
import com.soen390.flightcrew.model.ShuttleTimeDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.DayOfWeek;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ShuttleScheduleServiceTest {

    private ShuttleScheduleService service;

    @BeforeEach
    void setUp() {
        service = new ShuttleScheduleService(new ObjectMapper());
        ReflectionTestUtils.setField(service, "scheduleFileName", "shuttle_schedule.json");
        service.loadScheduleData();
    }

    // ── Schedule: weekday selection ──────────────────────────────────

    @Test
    @DisplayName("Monday returns Monday–Thursday schedule with 34 departures")
    void getSchedule_monday_returnsMondayThursdaySchedule() {
        ShuttleScheduleResponse response = service.getSchedule(DayOfWeek.MONDAY);

        assertEquals("MONDAY", response.getDay());
        assertFalse(response.isNoService());
        assertEquals(34, response.getDepartures().size());
    }

    @Test
    @DisplayName("Wednesday returns the same Monday–Thursday schedule")
    void getSchedule_wednesday_returnsMondayThursdaySchedule() {
        ShuttleScheduleResponse response = service.getSchedule(DayOfWeek.WEDNESDAY);

        assertEquals("WEDNESDAY", response.getDay());
        assertFalse(response.isNoService());
        assertEquals(34, response.getDepartures().size());
    }

    @Test
    @DisplayName("Thursday returns the same Monday–Thursday schedule")
    void getSchedule_thursday_returnsMondayThursdaySchedule() {
        ShuttleScheduleResponse response = service.getSchedule(DayOfWeek.THURSDAY);

        assertEquals("THURSDAY", response.getDay());
        assertFalse(response.isNoService());
        assertEquals(34, response.getDepartures().size());
    }

    @Test
    @DisplayName("Friday returns the Friday schedule with 23 departures")
    void getSchedule_friday_returnsFridaySchedule() {
        ShuttleScheduleResponse response = service.getSchedule(DayOfWeek.FRIDAY);

        assertEquals("FRIDAY", response.getDay());
        assertFalse(response.isNoService());
        assertEquals(23, response.getDepartures().size());
    }

    // ── Schedule: weekends ───────────────────────────────────────────

    @Test
    @DisplayName("Saturday returns noService with empty departures")
    void getSchedule_saturday_returnsNoService() {
        ShuttleScheduleResponse response = service.getSchedule(DayOfWeek.SATURDAY);

        assertEquals("SATURDAY", response.getDay());
        assertTrue(response.isNoService());
        assertNull(response.getServiceStart());
        assertNull(response.getServiceEnd());
        assertTrue(response.getDepartures().isEmpty());
    }

    @Test
    @DisplayName("Sunday returns noService with empty departures")
    void getSchedule_sunday_returnsNoService() {
        ShuttleScheduleResponse response = service.getSchedule(DayOfWeek.SUNDAY);

        assertEquals("SUNDAY", response.getDay());
        assertTrue(response.isNoService());
        assertTrue(response.getDepartures().isEmpty());
    }

    // ── Service window ───────────────────────────────────────────────

    @Test
    @DisplayName("Monday–Thursday service starts at 09:15 and ends at 18:30")
    void getSchedule_mondayThursday_serviceWindow() {
        ShuttleScheduleResponse response = service.getSchedule(DayOfWeek.TUESDAY);

        assertEquals("09:15", response.getServiceStart());
        assertEquals("18:30", response.getServiceEnd());
    }

    @Test
    @DisplayName("Friday service starts at 09:15 and ends at 18:15")
    void getSchedule_friday_serviceWindow() {
        ShuttleScheduleResponse response = service.getSchedule(DayOfWeek.FRIDAY);

        assertEquals("09:15", response.getServiceStart());
        assertEquals("18:15", response.getServiceEnd());
    }

    // ── Last bus flag ────────────────────────────────────────────────

    @Test
    @DisplayName("Monday–Thursday last two entries are flagged as last bus")
    void getSchedule_mondayThursday_lastBusFlags() {
        List<ShuttleTimeDTO> departures = service.getSchedule(DayOfWeek.MONDAY).getDepartures();

        ShuttleTimeDTO secondToLast = departures.get(departures.size() - 2);
        ShuttleTimeDTO last = departures.get(departures.size() - 1);

        assertTrue(secondToLast.isLastBus());
        assertTrue(last.isLastBus());
        assertNull(last.getSgwDeparture());
    }

    @Test
    @DisplayName("Friday last two entries are flagged as last bus")
    void getSchedule_friday_lastBusFlags() {
        List<ShuttleTimeDTO> departures = service.getSchedule(DayOfWeek.FRIDAY).getDepartures();

        ShuttleTimeDTO secondToLast = departures.get(departures.size() - 2);
        ShuttleTimeDTO last = departures.get(departures.size() - 1);

        assertTrue(secondToLast.isLastBus());
        assertTrue(last.isLastBus());
        assertNull(last.getSgwDeparture());
    }

    @Test
    @DisplayName("First departure is not flagged as last bus")
    void getSchedule_firstDeparture_notLastBus() {
        List<ShuttleTimeDTO> deps = service.getSchedule(DayOfWeek.MONDAY).getDepartures();
        ShuttleTimeDTO first = deps.get(0);

        assertFalse(first.isLastBus());
        assertNotNull(first.getSgwDeparture());
    }

    // ── Route ────────────────────────────────────────────────────────

    @Test
    @DisplayName("Route contains 102 coordinates in SGW-to-Loyola direction")
    void getRoute_sgwToLoyola_has102Coordinates() {
        ShuttleRouteResponse route = service.getRoute();

        assertEquals(102, route.getSgwToLoyola().size());
    }

    @Test
    @DisplayName("Loyola-to-SGW is the reverse of SGW-to-Loyola")
    void getRoute_loyolaToSgw_isReversed() {
        ShuttleRouteResponse route = service.getRoute();

        List<CoordinateDTO> sgwToLoy = route.getSgwToLoyola();
        List<CoordinateDTO> loyToSgw = route.getLoyolaToSgw();

        assertEquals(sgwToLoy.size(), loyToSgw.size());
        assertEquals(sgwToLoy.get(0).getLatitude(), loyToSgw.get(loyToSgw.size() - 1).getLatitude());
        assertEquals(sgwToLoy.get(0).getLongitude(), loyToSgw.get(loyToSgw.size() - 1).getLongitude());
        assertEquals(sgwToLoy.get(sgwToLoy.size() - 1).getLatitude(), loyToSgw.get(0).getLatitude());
        assertEquals(sgwToLoy.get(sgwToLoy.size() - 1).getLongitude(), loyToSgw.get(0).getLongitude());
    }

    @Test
    @DisplayName("Route duration and distance match known constants")
    void getRoute_durationAndDistance() {
        ShuttleRouteResponse route = service.getRoute();

        assertEquals("21 mins", route.getDuration());
        assertEquals("8.3 km", route.getDistance());
    }

    @Test
    @DisplayName("First coordinate of SGW-to-Loyola is near Hall building")
    void getRoute_firstCoordinate_nearHallBuilding() {
        CoordinateDTO first = service.getRoute().getSgwToLoyola().get(0);

        assertEquals(45.49697, first.getLatitude(), 0.001);
        assertEquals(-73.57851, first.getLongitude(), 0.001);
    }

    // ── File loading errors ──────────────────────────────────────────

    @Test
    @DisplayName("Missing schedule file throws IllegalStateException")
    void loadScheduleData_missingFile_throws() {
        ShuttleScheduleService badService = new ShuttleScheduleService(new ObjectMapper());
        ReflectionTestUtils.setField(badService, "scheduleFileName", "nonexistent.json");

        assertThrows(IllegalStateException.class, badService::loadScheduleData);
    }
}
