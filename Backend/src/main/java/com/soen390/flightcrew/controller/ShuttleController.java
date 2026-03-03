package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.ShuttleRouteResponse;
import com.soen390.flightcrew.model.ShuttleScheduleResponse;
import com.soen390.flightcrew.service.ShuttleScheduleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/shuttle")
public class ShuttleController {

    private static final Logger logger = LoggerFactory.getLogger(ShuttleController.class);

    private final ShuttleScheduleService shuttleScheduleService;

    public ShuttleController(ShuttleScheduleService shuttleScheduleService) {
        this.shuttleScheduleService = shuttleScheduleService;
    }

    /**
     * Returns the shuttle schedule for the given day. Defaults to today if omitted.
     *
     * @param day optional day of week (e.g. MONDAY, FRIDAY)
     * @return 200 with schedule, or 400 if the day parameter is invalid
     */
    @GetMapping("/schedule")
    public ResponseEntity<Object> getSchedule(@RequestParam(required = false) String day) {
        DayOfWeek dayOfWeek;

        if (day == null || day.isBlank()) {
            dayOfWeek = LocalDate.now().getDayOfWeek();
            logger.info("No day specified, defaulting to {}", dayOfWeek);
        } else {
            try {
                dayOfWeek = DayOfWeek.valueOf(day.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid day parameter: {}", day);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "invalid_day",
                                "message", "Invalid day: " + day
                                        + ". Expected one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY"));
            }
        }

        ShuttleScheduleResponse response = shuttleScheduleService.getSchedule(dayOfWeek);
        return ResponseEntity.ok(response);
    }

    /**
     * Returns the fixed shuttle route polyline between SGW and Loyola campuses.
     *
     * @return 200 with route data (polyline coordinates, duration, distance)
     */
    @GetMapping("/route")
    public ResponseEntity<ShuttleRouteResponse> getRoute() {
        ShuttleRouteResponse response = shuttleScheduleService.getRoute();
        return ResponseEntity.ok(response);
    }
}
