package com.soen390.flightcrew.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.soen390.flightcrew.model.CalendarEventDTO;
import com.soen390.flightcrew.service.GoogleCalendarService;
import java.util.List;

@RestController
@RequestMapping("/api/v1/calendar")
public class CalendarController {

    private final GoogleCalendarService calendarService;

    public CalendarController(GoogleCalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @GetMapping("/events")
    public ResponseEntity<List<CalendarEventDTO>> getEvents(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String timeMin,
            @RequestParam(required = false) String timeMax) {

        String accessToken = authHeader.replace("Bearer ", "");

        List<CalendarEventDTO> events = calendarService.fetchEvents(
                accessToken, timeMin, timeMax);

        return ResponseEntity.ok(events);
    }
}
