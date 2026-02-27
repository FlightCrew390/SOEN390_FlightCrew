package com.soen390.flightcrew.controller;

import com.soen390.flightcrew.model.DirectionsResponse;
import com.soen390.flightcrew.service.GoogleMapsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.soen390.flightcrew.service.ApiQuotaService;

import java.util.Map;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api")
public class DirectionsController {

    Logger logger = Logger.getLogger(DirectionsController.class.getName());

    private final GoogleMapsService googleMapsService;
    private final ApiQuotaService quotaService;

    public DirectionsController(GoogleMapsService googleMapsService, ApiQuotaService quotaService) {
        this.googleMapsService = googleMapsService;
        this.quotaService = quotaService;
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

    @GetMapping("/quota/status")
    public ResponseEntity<Map<String, Object>> getQuotaStatus() {
        return ResponseEntity.ok(Map.of(
                "monthlyUsage", quotaService.getMonthlyUsage(),
                "monthlyLimit", quotaService.getMonthlyLimit(),
                "remaining", quotaService.getRemainingMonthlyQuota()));
    }
}
