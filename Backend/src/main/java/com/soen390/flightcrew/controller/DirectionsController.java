package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.DirectionsResponse;
import com.soen390.flightcrew.service.GoogleMapsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
public class DirectionsController {

    Logger logger = LoggerFactory.getLogger(DirectionsController.class.getName());

    private final GoogleMapsService googleMapsService;

    public DirectionsController(GoogleMapsService googleMapsService) {
        this.googleMapsService = googleMapsService;
    }

    @GetMapping("/directions")
    public ResponseEntity<DirectionsResponse> getDirections(
            @RequestParam Double originLat,
            @RequestParam Double originLng,
            @RequestParam Double destLat,
            @RequestParam Double destLng,
            @RequestParam(defaultValue = "WALK") String travelMode) {

        DirectionsResponse response = googleMapsService.getDirections(
                originLat, originLng, destLat, destLng, travelMode);

        if (response == null || response.getRoutes() == null || response.getRoutes().isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(response);
    }
}
