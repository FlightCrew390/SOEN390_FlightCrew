package com.soen390.flightcrew.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.soen390.flightcrew.model.CalendarEventDTO;
import com.soen390.flightcrew.model.CalendarInfoDTO;
import com.soen390.flightcrew.service.GoogleCalendarService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/calendar")
public class CalendarController {

    private final GoogleCalendarService calendarService;

    public CalendarController(GoogleCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/list")
    public ResponseEntity<List<CalendarInfoDTO>> getCalendarList(
            @RequestHeader("Authorization") String authHeader) {

        String accessToken = authHeader.replace("Bearer ", "");

        List<CalendarInfoDTO> calendars = calendarService.fetchCalendarList(accessToken);

        return ResponseEntity.ok(calendars);
    }

    @GetMapping("/events")
    public ResponseEntity<List<CalendarEventDTO>> getEvents(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String timeMin,
            @RequestParam(required = false) String timeMax,
            @RequestParam(required = false) String calendarId) {

        String accessToken = authHeader.replace("Bearer ", "");

        List<CalendarEventDTO> events = calendarService.fetchEvents(
                accessToken, timeMin, timeMax, calendarId);

        return ResponseEntity.ok(events);
    }
}
