package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.NavigationRouteDTO;
import com.soen390.flightcrew.service.NavigationRouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/navigation")
public class NavigationController {

    private final NavigationRouteService navigationRouteService;

    public NavigationController(NavigationRouteService navigationRouteService) {
        this.navigationRouteService = navigationRouteService;
    }

    @GetMapping("/route")
    public ResponseEntity<NavigationRouteDTO> getParsedRoute(
            @RequestParam Double originLat,
            @RequestParam Double originLng,
            @RequestParam Double destLat,
            @RequestParam Double destLng,
            @RequestParam(defaultValue = "WALK") String travelMode,
            @RequestParam(required = false) String departureTime,
            @RequestParam(required = false) String arrivalTime) {

        NavigationRouteDTO route = navigationRouteService.getParsedRoute(
                originLat,
                originLng,
                destLat,
                destLng,
                travelMode,
                departureTime,
                arrivalTime);

        if (route == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(route);
    }
}
